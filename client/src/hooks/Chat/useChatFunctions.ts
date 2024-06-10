import { v4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import {
  Constants,
  QueryKeys,
  ContentTypes,
  parseCompactConvo,
  isAssistantsEndpoint,
} from 'librechat-data-provider';
import { useSetRecoilState } from 'recoil';
import type {
  TMessage,
  TSubmission,
  TConversation,
  TEndpointOption,
  TEndpointsConfig,
} from 'librechat-data-provider';
import type { SetterOrUpdater } from 'recoil';
import type { TAskFunction, ExtendedFile } from '~/common';
import useSetFilesToDelete from '~/hooks/Files/useSetFilesToDelete';
import useGetSender from '~/hooks/Conversations/useGetSender';
import useUserKey from '~/hooks/Input/useUserKey';
import { getEndpointField } from '~/utils';
import store from '~/store';

export default function useChatFunctions({
  index = 0,
  conversation,
  latestMessage,
  getMessages,
  setMessages,
  isSubmitting,
  files,
  setFiles,
}: {
  index?: number;
  isSubmitting: boolean;
  paramId?: string | undefined;
  conversation: TConversation | null;
  latestMessage: TMessage | null;
  getMessages: () => TMessage[] | undefined;
  setMessages: (messages: TMessage[]) => void;
  files?: Map<string, ExtendedFile>;
  setFiles?: SetterOrUpdater<Map<string, ExtendedFile>>;
}) {
  const setShowStopButton = useSetRecoilState(store.showStopButtonByIndex(index));
  const setFilesToDelete = useSetFilesToDelete();
  const getSender = useGetSender();

  const queryClient = useQueryClient();
  const { getExpiry } = useUserKey(conversation?.endpoint ?? '');
  const setLatestMessage = useSetRecoilState(store.latestMessageFamily(index));
  const setSubmission = useSetRecoilState(store.submissionByIndex(index));

  const ask: TAskFunction = (
    { text, parentMessageId = null, conversationId = null, messageId = null },
    {
      editedText = null,
      editedMessageId = null,
      resubmitFiles = false,
      isRegenerate = false,
      isContinued = false,
      isEdited = false,
    } = {},
  ) => {
    setShowStopButton(false);
    if (!!isSubmitting || text === '') {
      return;
    }

    const endpoint = conversation?.endpoint;
    if (endpoint === null) {
      console.error('No endpoint available');
      return;
    }

    conversationId = conversationId ?? conversation?.conversationId ?? null;
    if (conversationId == 'search') {
      console.error('cannot send any message under search view!');
      return;
    }

    if (isContinued && !latestMessage) {
      console.error('cannot continue AI message without latestMessage!');
      return;
    }

    const isEditOrContinue = isEdited || isContinued;

    let currentMessages: TMessage[] | null = getMessages() ?? [];

    // construct the query message
    // this is not a real messageId, it is used as placeholder before real messageId returned
    text = text.trim();
    const fakeMessageId = v4();
    parentMessageId = parentMessageId || latestMessage?.messageId || Constants.NO_PARENT;

    if (conversationId == 'new') {
      parentMessageId = Constants.NO_PARENT;
      currentMessages = [];
      conversationId = null;
    }

    const parentMessage = currentMessages?.find(
      (msg) => msg.messageId === latestMessage?.parentMessageId,
    );

    let thread_id = parentMessage?.thread_id ?? latestMessage?.thread_id;
    if (!thread_id) {
      thread_id = currentMessages.find((message) => message.thread_id)?.thread_id;
    }

    const endpointsConfig = queryClient.getQueryData<TEndpointsConfig>([QueryKeys.endpoints]);
    const endpointType = getEndpointField(endpointsConfig, endpoint, 'type');

    // set the endpoint option
    const convo = parseCompactConvo({
      endpoint,
      endpointType,
      conversation: conversation ?? {},
    });

    const { modelDisplayLabel } = endpointsConfig?.[endpoint ?? ''] ?? {};
    const endpointOption = {
      ...convo,
      endpoint,
      endpointType,
      modelDisplayLabel,
      key: getExpiry(),
      thread_id,
    } as TEndpointOption;
    const responseSender = getSender({ model: conversation?.model, ...endpointOption });

    const currentMsg: TMessage = {
      text,
      sender: 'User',
      isCreatedByUser: true,
      parentMessageId,
      conversationId,
      messageId: isContinued && messageId ? messageId : fakeMessageId,
      thread_id,
      error: false,
    };

    const reuseFiles = (isRegenerate || resubmitFiles) && parentMessage?.files;
    if (setFiles && reuseFiles && parentMessage.files?.length) {
      currentMsg.files = parentMessage.files;
      setFiles(new Map());
      setFilesToDelete({});
    } else if (setFiles && files && files.size > 0) {
      currentMsg.files = Array.from(files.values()).map((file) => ({
        file_id: file.file_id,
        filepath: file.filepath,
        type: file.type || '', // Ensure type is not undefined
        height: file.height,
        width: file.width,
      }));
      setFiles(new Map());
      setFilesToDelete({});
    }

    // construct the placeholder response message
    const generation = editedText ?? latestMessage?.text ?? '';
    const responseText = isEditOrContinue ? generation : '';

    const responseMessageId = editedMessageId ?? latestMessage?.messageId ?? null;
    const initialResponse: TMessage = {
      sender: responseSender,
      text: responseText,
      endpoint: endpoint ?? '',
      parentMessageId: isRegenerate ? messageId : fakeMessageId,
      messageId: responseMessageId ?? `${isRegenerate ? messageId : fakeMessageId}_`,
      thread_id,
      conversationId,
      unfinished: false,
      isCreatedByUser: false,
      isEdited: isEditOrContinue,
      iconURL: convo.iconURL,
      error: false,
    };

    if (isAssistantsEndpoint(endpoint)) {
      initialResponse.model = conversation?.assistant_id ?? '';
      initialResponse.text = '';
      initialResponse.content = [
        {
          type: ContentTypes.TEXT,
          [ContentTypes.TEXT]: {
            value: responseText,
          },
        },
      ];
    } else {
      setShowStopButton(true);
    }

    if (isContinued) {
      currentMessages = currentMessages.filter((msg) => msg.messageId !== responseMessageId);
    }

    const submission: TSubmission = {
      conversation: {
        ...conversation,
        conversationId,
      },
      endpointOption,
      userMessage: {
        ...currentMsg,
        generation,
        responseMessageId,
        overrideParentMessageId: isRegenerate ? messageId : null,
      },
      messages: currentMessages,
      isEdited: isEditOrContinue,
      isContinued,
      isRegenerate,
      initialResponse,
    };

    if (isRegenerate) {
      setMessages([...submission.messages, initialResponse]);
    } else {
      setMessages([...submission.messages, currentMsg, initialResponse]);
    }
    setLatestMessage(initialResponse);
    setSubmission(submission);
  };

  const regenerate = ({ parentMessageId }) => {
    const messages = getMessages();
    const parentMessage = messages?.find((element) => element.messageId == parentMessageId);

    if (parentMessage && parentMessage.isCreatedByUser) {
      ask({ ...parentMessage }, { isRegenerate: true });
    } else {
      console.error(
        'Failed to regenerate the message: parentMessage not found or not created by user.',
      );
    }
  };

  return {
    ask,
    regenerate,
  };
}