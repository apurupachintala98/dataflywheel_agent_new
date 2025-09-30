// export interface MessageType {
//   text: string | React.ReactNode;
//   fromUser: boolean;
//   streaming?: boolean;
//   isHTML?: boolean;
//   isCode?: boolean;
//   sqlQuery?: string;
//   showExecute?: boolean;
//   showSummarize?: boolean;
//   executedResponse?: any;
//   summarized?: boolean;
//   prompt?: string;
//   interpretation?: string;
//   showFeedback?: boolean;
//   type?: "text" | "sql" | "table";
//   fdbck_id?: string;      
//   session_id?: string;
// }

// src/types/message.types.ts

export interface MessageType {
  // --- new fields (for streaming & unified messages) ---
  id: string;                         // unique ID for each message
  type: "user" | "assistant";         // who sent it
  content?: string;                   // new style text field
  thinking?: string;                  // assistant "thinking"
  sql?: string;                       // SQL queries
  isStreaming?: boolean;              // whether message is streaming
  showDetails?: boolean;              // toggle details in UI

  // --- legacy fields (keep for compatibility with old code) ---
  text?: string;                      // old field used before "content"
  fromUser?: boolean;                 // legacy boolean instead of type
  streaming?: boolean;
  isCode?: boolean;
  showExecute?: boolean;
  sqlQuery?: string;
  interpretation?: string;
  isHTML?: boolean;
  fdbck_id?: string;
  session_id?: string;
  executedResponse?: any;
  summarized?: boolean;
  showSummarize?: boolean;
  showFeedback?: boolean;
  prompt?: string;
}
