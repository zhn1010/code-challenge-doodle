export type Message = {
  _id: string;
  message: string;
  author: string;
  createdAt: string;
};

export type ChatMessageItem = {
  id: string;
  author?: string;
  body: string;
  timestamp: string;
  variant: 'incoming' | 'outgoing';
};

export type GetMessagesParams = {
  limit?: number;
  after?: string;
  before?: string;
};

export type CreateMessageInput = {
  message: string;
  author: string;
};

export type ApiValidationIssue = {
  field: string;
  message: string;
};

export type ApiErrorMessage = string | ApiValidationIssue[];

export type ApiErrorResponse = {
  error?: {
    message?: ApiErrorMessage;
    timestamp?: string;
  };
};

export type NormalizedApiError = {
  statusCode: number;
  message: string;
  issues: ApiValidationIssue[];
  timestamp?: string;
};
