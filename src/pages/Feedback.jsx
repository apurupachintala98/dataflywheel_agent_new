import { useState, useEffect, useRef } from "react";
import { Button, Box, IconButton, Typography, Tooltip, TextField } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import PropTypes from "prop-types";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PaginatedTable from "../components/PaginatedTable";
import SendIcon from "@mui/icons-material/Send";
import BarChartIcon from "@mui/icons-material/BarChart";
import axios from "axios";
import { config } from "../hooks/config";
import { toast } from "react-toastify";
import { FirstMessageCon, SecondMessageCon, MessageContainer } from "./styled.components";
import DataFlyWheelLogo from "assests/images/loadingBlack.png";
import { useSelectedApp } from "components/SelectedAppContext";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion"
import { ChevronDown } from "lucide-react";
import { VegaLite } from 'react-vega';
import loading from "assests/images/loading.png";
import { CssTextField, Loader } from "./styled.components";
import { Tabs, Tab } from "@mui/material";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";


const Feedback = ({ message }) => {
  const { selectedAppId } = useSelectedApp();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");
  const [thumb, setThumb] = useState(null);
  const [lastSubmittedComment, setLastSubmittedComment] = useState("");

  const handleCopy = async () => {
    if (!message?.text) {
      console.error("Message is undefined or empty");
      return;
    }
    try {
      await navigator.clipboard.writeText(message.text);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const sendFeedback = async ({ action = null, commentText = null }) => {
    const { APP_CONFIG, API_BASE_URL, ENDPOINTS } = config(selectedAppId);
    const fdbck_id = message.fdbck_id || "";
    const session_id = message.session_id || "";
    const feedbk_actn_txt = typeof action === "boolean" ? (action ? "True" : "False") : action;
    const feedbk_cmnt_txt = commentText !== undefined ? commentText : lastSubmittedComment;
    const url =
      `${API_BASE_URL}${ENDPOINTS.FEEDBACK}?` +
      `fdbck_id=${encodeURIComponent(fdbck_id)}&` +
      `session_id=${encodeURIComponent(session_id)}&` +
      `feedbk_actn_txt=${encodeURIComponent(feedbk_actn_txt)}&` +
      `feedbk_cmnt_txt=${encodeURIComponent(feedbk_cmnt_txt)}`;
    try {
      const response = await axios.post(url);
      console.log("Feedback sent successfully:", response.data);
      toast.success("Feedback submitted successfully!", { position: "top-right" });
      if (action === true) setThumb("up");
      else if (action === false) setThumb("down");
      if (commentText !== undefined) {
        setLastSubmittedComment(commentText);
      }
    } catch (err) {
      console.error("Failed to send feedback", err);
      toast.error("Failed to submit feedback", { position: "top-right" });
    }
  };

  const handleThumbClick = (isPositive) => {
    sendFeedback({ action: isPositive });
  };

  const handleCommentSubmit = () => {
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;
    sendFeedback({
      commentText: trimmedComment,
      action: thumb === "up" ? true : thumb === "down" ? false : null,
    });
    setComment("");
    setShowCommentBox(false);
  };



  return (
    <div className="flex space-x-4 p-2 border-t" style={{ textAlign: "left", marginTop: "10px" }}>
      <Tooltip title="Copy">
        <IconButton onClick={handleCopy} sx={{ color: "#000" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="icon-md-heavy"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
              fill="currentColor"
            ></path>
          </svg>
        </IconButton>
      </Tooltip>
      <Tooltip title="Good Response">
        <IconButton
          onClick={() => handleThumbClick(true)}
          sx={{
            backgroundColor: thumb === "up" ? "#000" : "transparent",
            color: thumb === "up" ? "#fff" : "inherit",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="icon-md-heavy"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.1318 2.50389C12.3321 2.15338 12.7235 1.95768 13.124 2.00775L13.5778 2.06447C16.0449 2.37286 17.636 4.83353 16.9048 7.20993L16.354 8.99999H17.0722C19.7097 8.99999 21.6253 11.5079 20.9313 14.0525L19.5677 19.0525C19.0931 20.7927 17.5124 22 15.7086 22H6C4.34315 22 3 20.6568 3 19V12C3 10.3431 4.34315 8.99999 6 8.99999H8C8.25952 8.99999 8.49914 8.86094 8.6279 8.63561L12.1318 2.50389ZM10 20H15.7086C16.6105 20 17.4008 19.3964 17.6381 18.5262L19.0018 13.5262C19.3488 12.2539 18.391 11 17.0722 11H15C14.6827 11 14.3841 10.8494 14.1956 10.5941C14.0071 10.3388 13.9509 10.0092 14.0442 9.70591L14.9932 6.62175C15.3384 5.49984 14.6484 4.34036 13.5319 4.08468L10.3644 9.62789C10.0522 10.1742 9.56691 10.5859 9 10.8098V19C9 19.5523 9.44772 20 10 20ZM7 11V19C7 19.3506 7.06015 19.6872 7.17071 20H6C5.44772 20 5 19.5523 5 19V12C5 11.4477 5.44772 11 6 11H7Z"
              fill="currentColor"
            ></path>
          </svg>
        </IconButton>
      </Tooltip>
      <Tooltip title="Bad Response">
        <IconButton
          onClick={() => handleThumbClick(false)}
          sx={{
            backgroundColor: thumb === "down" ? "#000" : "transparent",
            color: thumb === "down" ? "#fff" : "inherit",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="icon-md-heavy"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.8727 21.4961C11.6725 21.8466 11.2811 22.0423 10.8805 21.9922L10.4267 21.9355C7.95958 21.6271 6.36855 19.1665 7.09975 16.7901L7.65054 15H6.93226C4.29476 15 2.37923 12.4921 3.0732 9.94753L4.43684 4.94753C4.91145 3.20728 6.49209 2 8.29589 2H18.0045C19.6614 2 21.0045 3.34315 21.0045 5V12C21.0045 13.6569 19.6614 15 18.0045 15H16.0045C15.745 15 15.5054 15.1391 15.3766 15.3644L11.8727 21.4961ZM14.0045 4H8.29589C7.39399 4 6.60367 4.60364 6.36637 5.47376L5.00273 10.4738C4.65574 11.746 5.61351 13 6.93226 13H9.00451C9.32185 13 9.62036 13.1506 9.8089 13.4059C9.99743 13.6612 10.0536 13.9908 9.96028 14.2941L9.01131 17.3782C8.6661 18.5002 9.35608 19.6596 10.4726 19.9153L13.6401 14.3721C13.9523 13.8258 14.4376 13.4141 15.0045 13.1902V5C15.0045 4.44772 14.5568 4 14.0045 4ZM17.0045 13V5C17.0045 4.64937 16.9444 4.31278 16.8338 4H18.0045C18.5568 4 19.0045 4.44772 19.0045 5V12C19.0045 12.5523 18.5568 13 18.0045 13H17.0045Z"
              fill="currentColor"
            ></path>
          </svg>
        </IconButton>
      </Tooltip>
      <Tooltip title="Comment">
        <IconButton onClick={() => setShowCommentBox((prev) => !prev)} sx={{ color: "#000" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="icon-md-heavy"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 5C3 3.34315 4.34315 2 6 2H18C19.6569 2 21 3.34315 21 5V15C21 16.6569 19.6569 18 18 18H8.41421L4.70711 21.7071C4.07714 22.3371 3 21.8896 3 21.0001V5ZM6 4C5.44772 4 5 4.44772 5 5V18.5858L7.29289 16.2929C7.68342 15.9024 8.31658 15.9024 8.70711 16.2929L9.41421 17H18C18.5523 17 19 16.5523 19 16V5C19 4.44772 18.5523 4 18 4H6Z"
              fill="currentColor"
            />
          </svg>
        </IconButton>
      </Tooltip>
      {/* Conditional Comment Input */}
      {/* {showCommentBox && (
                <div className="flex items-center space-x-2">
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{ width: 200 }}
                    />
                    <IconButton onClick={handleCommentSubmit}>
                        <SendIcon />
                    </IconButton>
                </div>
            )} */}

      {showCommentBox && (
        <div className="flex items-center" style={{ marginTop: "20px" }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              width: 280,
              backgroundColor: "#f9f9f9",
              "& .MuiOutlinedInput-root": {
                paddingRight: 0,
              },
              "& input": {
                padding: "10px",
              },
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={handleCommentSubmit}
                  sx={{
                    backgroundColor: "#e0e0e0",
                    marginRight: "4px",
                    "&:hover": { backgroundColor: "#c2c2c2" },
                    padding: "6px",
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </div>
      )}
    </div>
  );
};

// // Reusable SQL code block
// const SQLCodeBlock = ({ code }) => {
//   return (
//     <div className="border rounded-lg overflow-hidden">
//       <div className="bg-muted px-3 py-2 text-sm font-medium">Generated SQL</div>
//       <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm">
//         <code className="language-sql">{code}</code>
//       </pre>
//     </div>
//   )
// }

// // Main message renderer
// const MessageWithFeedback = ({ message, handleGraphClick }) => {
//   return (
//     <div className="space-y-3">
//       {message.thinking && !message.isStreaming && (
//         <Accordion type="single" collapsible>
//           <AccordionItem value="thinking">
//             <AccordionTrigger className="text-sm font-medium justify-end">
//               Show Details
//             </AccordionTrigger>
//             <AccordionContent>
//               <div className="text-sm text-muted-foreground whitespace-pre-wrap">
//                 {message.thinking}
//               </div>
//             </AccordionContent>
//           </AccordionItem>
//         </Accordion>
//       )}

//       {message.thinking && message.isStreaming && (
//         <div className="border rounded-lg p-3 bg-muted/50">
//           <div className="text-sm font-medium mb-2 flex items-center gap-2">
//             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
//             Thinking...
//           </div>
//           <div className="text-sm text-muted-foreground whitespace-pre-wrap">
//             {message.thinking}
//           </div>
//         </div>
//       )}

//       {/* SQL code block */}
//       {message.sql && <SQLCodeBlock code={message.sql} />}

//       {/* Normal content */}
//       {message.content && (
//         <div className="whitespace-pre-wrap">
//           {message.content}
//           {message.isStreaming && (
//             <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

const SQLCodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white relative">
      {/* Header bar with label on left and icon on far right */}
      <div className="bg-gray-100 px-3 py-2 text-sm font-weight-bold border-b flex justify-between items-center">
        <span className="inline-block bg-blue-50 text-blue-700 border border-blue-300 px-3 py-1 rounded-md">
          Generated SQL
        </span>
        <Tooltip title={copied ? "Copied!" : "Copy SQL"} arrow>
          <ContentCopyIcon
            onClick={handleCopy}
            className="cursor-pointer text-blue-600 hover:text-blue-800"
            fontSize="small"
          />
        </Tooltip>
      </div>

      {/* SQL content */}
      <SyntaxHighlighter
        language="sql"
        style={dracula}
        customStyle={{
          margin: 0,
          padding: "16px",
          fontSize: "0.85rem",
          borderRadius: "0 0 8px 8px",
        }}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// ✅ Main message renderer
const MessageWithFeedback = ({ message }) => {
  console.log(message, "message info");
  const isUser = message.fromUser;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  const chartContainerRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatRichText = (text) => {
    if (!text) return "";

    // Convert URLs into clickable hyperlinks
    text = text.replace(
      /(https?:\/\/[^\s<]+)/g,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );

    // Bolden step headers like "Step 1:"
    text = text.replace(/(Step \d+:)/g, "<strong>$1</strong>");

    // Bolden phrases before colon inside bullet points
    text = text.replace(/^- ([^:\n]+):\s*(.*)/gm, (_, label, rest) => `- <strong>${label}:</strong> ${rest}`);

    // Bolden numbered list items like "1.", "2.", "3." at the start of a line
    text = text.replace(/^(\d+\.)\s+/gm, (_, number) => `<strong>${number}</strong> `);

    // Bolden section headers like "Top Project Leaders:"
    text = text.replace(/^([^\n:]+):\s*$/gm, "<strong>$1</strong>");

    // Convert name-value pairs like "Anil: 14 projects" into bullet-style lines
    text = text.replace(/^([^\n:]+):\s*(.+)$/gm, (_, label, value) => `• <strong>${label}:</strong> ${value}`);

    // Add line breaks between paragraphs and lines
    text = text.replace(/\n{2,}/g, "<br/><br/>"); // double line breaks → paragraph breaks
    text = text.replace(/\n/g, "<br/>"); // single line breaks → line breaks

    return text;
  };

  const downloadCSV = (data, fields, filename = "chart-data.csv") => {
    const csvRows = [];

    // Header
    csvRows.push(fields.join(","));

    // Rows
    data.forEach(row => {
      const values = fields.map(field => `"${row[field]}"`);
      csvRows.push(values.join(","));
    });

    // Create blob and trigger download
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    // <div className={`flex w-full my-3 ${isUser ? "justify-end" : "justify-start"}`}>
    //   <div className={`w-auto max-w-[80%] flex flex-col`}>
    //     {/* USER MESSAGE */}
    //     {isUser && (
    //       <div className="self-end w-full">
    //         <div className="bg-gray-100 text-black px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm">
    //           {message.text}
    //         </div>
    //       </div>
    //     )}

    //     {/* ASSISTANT MESSAGE */}
    //     {!isUser && (
    //       <Box sx={{ alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 2 }}>
    //         {message.thinking && (
    //           <Box
    //             sx={{
    //               border: "1px solid #ccc",
    //               borderRadius: "12px",
    //               padding: "12px",
    //               transition: "all 0.3s ease",
    //             }}
    //           >
    //             {message.isStreaming && message.thinking && (
    //               <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
    //                 <Loader src={loading} alt="Thinking..." />
    //                 <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
    //                   Thinking...
    //                 </Typography>
    //               </Box>
    //             )}

    //             {!message.isStreaming && message.thinking && (
    //               <Box>
    //                 <Button
    //                   size="small"
    //                   variant="text"
    //                   sx={{
    //                     textTransform: "none",
    //                     fontSize: "0.9rem",
    //                     color: "#1976d2",
    //                   }}
    //                   onClick={() => setDetailsOpen((prev) => !prev)}
    //                 >
    //                   {detailsOpen ? "Hide Details" : "Show Details"}
    //                 </Button>

    //                 {detailsOpen && (
    //                   <Typography
    //                     variant="body2"
    //                     sx={{
    //                       color: "#555",
    //                       lineHeight: 1.6,
    //                       "& strong": { fontWeight: 600 },
    //                       "& ul": { paddingLeft: "1.2em", marginBottom: "8px" },
    //                       "& ol": { paddingLeft: "1.2em", marginBottom: "8px" },
    //                       "& li": { marginBottom: "4px" },
    //                       "& p": { marginBottom: "8px" },
    //                     }}
    //                     dangerouslySetInnerHTML={{
    //                       __html: formatRichText(message.thinking),
    //                     }}
    //                   />
    //                 )}
    //               </Box>
    //             )}
    //           </Box>
    //         )}

    //         {message.sql && (
    //           <Box
    //             sx={{
    //               border: "1px solid #ccc",
    //               borderRadius: "12px",
    //               padding: "12px",
    //               backgroundColor: "#fff",
    //             }}
    //           >
    //             <SQLCodeBlock code={message.sql} />
    //           </Box>
    //         )}

    //         {message.content && (
    //           <Box
    //             sx={{
    //               border: "1px solid #ccc",
    //               borderRadius: "12px",
    //               padding: "12px",
    //               backgroundColor: "#fff",
    //             }}
    //           >
    //             <Typography
    //               variant="body2"
    //               sx={{
    //                 color: "#555",
    //                 lineHeight: 1.6,
    //                 "& strong": { fontWeight: 600 },
    //                 "& ul": { paddingLeft: "1.2em", marginBottom: "8px" },
    //                 "& ol": { paddingLeft: "1.2em", marginBottom: "8px" },
    //                 "& li": { marginBottom: "4px" },
    //                 "& p": { marginBottom: "8px" },
    //               }}
    //               dangerouslySetInnerHTML={{ __html: formatRichText(message.content) }}
    //             />
    //           </Box>
    //         )}

    //         {message.chart && (() => {
    //           const chartSpec = JSON.parse(message.chart);
    //           const chartData = chartSpec?.data?.values || [];
    //           const chartFields = chartData.length > 0 ? Object.keys(chartData[0]) : [];

    //           // Force chart to fit container
    //           chartSpec.autosize = { type: "fit-y", contains: "padding" };
    //           chartSpec.width = 600;
    //           return (
    //             <Box
    //               sx={{
    //                 border: "1px solid #ccc",
    //                 borderRadius: "12px",
    //                 padding: "12px",
    //                 backgroundColor: "#fff",
    //                 maxWidth: "100%",
    //                 overflowX: "hidden",
    //                 overflowY: "auto",
    //                 boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
    //                 marginTop: "12px",
    //               }}
    //             >
    //               {/* Tabs + Download Button */}
    //               <Box
    //                 sx={{
    //                   display: "flex",
    //                   justifyContent: "space-between",
    //                   alignItems: "center",
    //                   marginBottom: 0,
    //                 }}
    //               >
    //                 <Tabs
    //                   value={activeTab}
    //                   onChange={handleTabChange}
    //                   textColor="primary"
    //                   indicatorColor="primary"
    //                   sx={{ minHeight: 0, height: 36 }}
    //                   TabIndicatorProps={{ style: { height: 2 } }}
    //                 >
    //                   <Tab
    //                     label="Chart"
    //                     value="chart"
    //                     sx={{
    //                       minHeight: 0,
    //                       height: 36,
    //                       textTransform: "none",
    //                       fontWeight: 600,
    //                       border: "1px solid #ccc",
    //                       borderRadius: "8px 8px 0 0",
    //                       backgroundColor: "#f5f5f5",
    //                       boxShadow: activeTab === "chart" ? "0px 2px 4px rgba(0,0,0,0.1)" : "none",
    //                       marginRight: 1,
    //                     }}
    //                   />
    //                   <Tab
    //                     label="Table"
    //                     value="table"
    //                     sx={{
    //                       minHeight: 0,
    //                       height: 36,
    //                       textTransform: "none",
    //                       fontWeight: 600,
    //                       border: "1px solid #ccc",
    //                       borderRadius: "8px 8px 0 0",
    //                       backgroundColor: "#f5f5f5",
    //                       boxShadow: activeTab === "table" ? "0px 2px 4px rgba(0,0,0,0.1)" : "none",
    //                     }}
    //                   />
    //                 </Tabs>

    //                 {/* Show button only when table tab is active */}
    //                 {activeTab === "table" && chartData.length > 0 && (
    //                   <Button
    //                     variant="outlined"
    //                     size="small"
    //                     onClick={() => downloadCSV(chartData, chartFields)}
    //                     sx={{ height: 30 }}
    //                   >
    //                     Download CSV
    //                   </Button>
    //                 )}
    //               </Box>

    //               <Box sx={{ borderBottom: "1px solid #ccc", marginBottom: 2 }} />

    //               {/* Chart View */}
    //               {activeTab === "chart" && (
    //                 <Box sx={{ width: "100%", overflowX: "auto" }}>
    //                   <Box
    //                     sx={{
    //                       minWidth: "600px",
    //                       width: chartSpec.width ? `${chartSpec.width}px` : "100%",
    //                       paddingBottom: "8px",
    //                     }}
    //                   >
    //                     <VegaLite spec={chartSpec} />
    //                   </Box>
    //                 </Box>
    //               )}

    //               {/* Table View */}
    //               {activeTab === "table" && chartData.length > 0 && (
    //                 <Box sx={{ minWidth: "600px", width: "100%" }}>
    //                   <table
    //                     style={{
    //                       width: "100%",
    //                       borderCollapse: "collapse",
    //                       marginTop: "8px",
    //                       fontSize: "0.875rem",
    //                       backgroundColor: "#fff",
    //                     }}
    //                   >
    //                     <thead>
    //                       <tr>
    //                         {chartFields.map((field) => (
    //                           <th
    //                             key={field}
    //                             style={{
    //                               textAlign: "left",
    //                               padding: "6px 8px",
    //                               borderBottom: "1px solid #ddd",
    //                               fontSize: "0.875rem",
    //                               fontWeight: 600,
    //                               whiteSpace: "nowrap",
    //                             }}
    //                           >
    //                             {field.replace(/_/g, " ")}
    //                           </th>
    //                         ))}
    //                       </tr>
    //                     </thead>
    //                     <tbody>
    //                       {chartData.map((row, index) => (
    //                         <tr key={index}>
    //                           {chartFields.map((field) => (
    //                             <td
    //                               key={field}
    //                               style={{
    //                                 padding: "6px 8px",
    //                                 borderBottom: "1px solid #eee",
    //                                 fontSize: "0.875rem",
    //                                 whiteSpace: "nowrap",
    //                               }}
    //                             >
    //                               {row[field]}
    //                             </td>
    //                           ))}
    //                         </tr>
    //                       ))}
    //                     </tbody>
    //                   </table>
    //                 </Box>
    //               )}
    //             </Box>
    //           );

    //         })()}

    //       </Box>
    //     )}
    //   </div>
    // </div >
    <div className="w-full my-3">
      {/* Each message row is full width; bubble controls left/right placement */}
      <div className="w-full flex">
        {isUser ? (
          /* USER: push to the right with ml-auto */
          <div className="ml-auto w-auto max-w-[80%]">
            <div className="inline-block bg-blue-500 text-white px-4 py-3 rounded-2xl text-sm shadow-md rounded-br-none whitespace-pre-wrap">
              {message.text}
            </div>
          </div>
        ) : (
          /* ASSISTANT: push to the left with mr-auto */
          <div className="mr-auto w-auto max-w-[80%]">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "12px",
                boxShadow: "0px 1px 3px rgba(0,0,0,0.08)",
                width: "100%",
              }}
            >
              {/* Thinking */}
              {message.thinking && (
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: "12px",
                    padding: "12px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {message.isStreaming ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Loader src={loading} alt="Thinking..." />
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        Thinking...
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Button
                        size="small"
                        variant="text"
                        sx={{
                          textTransform: "none",
                          fontSize: "0.9rem",
                          color: "#1976d2",
                        }}
                        onClick={() => setDetailsOpen((prev) => !prev)}
                      >
                        {detailsOpen ? "Hide Details" : "Show Details"}
                      </Button>

                      {detailsOpen && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#555",
                            lineHeight: 1.6,
                            "& strong": { fontWeight: 600 },
                            "& ul": { paddingLeft: "1.2em", marginBottom: "8px" },
                            "& ol": { paddingLeft: "1.2em", marginBottom: "8px" },
                            "& li": { marginBottom: "4px" },
                            "& p": { marginBottom: "8px" },
                          }}
                          dangerouslySetInnerHTML={{ __html: formatRichText(message.thinking) }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {/* SQL */}
              {message.sql && (
                <Box sx={{ border: "1px solid #ccc", borderRadius: "12px", padding: "12px", backgroundColor: "#fff" }}>
                  <SQLCodeBlock code={message.sql} />
                </Box>
              )}

              {/* Content */}
              {message.content && (
                <Box sx={{ border: "1px solid #ccc", borderRadius: "12px", padding: "12px", backgroundColor: "#fff" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#555",
                      lineHeight: 1.6,
                      "& strong": { fontWeight: 600 },
                      "& ul": { paddingLeft: "1.2em", marginBottom: "8px" },
                      "& ol": { paddingLeft: "1.2em", marginBottom: "8px" },
                      "& li": { marginBottom: "4px" },
                      "& p": { marginBottom: "8px" },
                    }}
                    dangerouslySetInnerHTML={{ __html: formatRichText(message.content) }}
                  />
                </Box>
              )}

              {/* Chart / Table block (keeps same internals as before) */}
              {message.chart && (() => {
                const chartSpec = JSON.parse(message.chart);
                const chartData = chartSpec?.data?.values || [];
                const chartFields = chartData.length > 0 ? Object.keys(chartData[0]) : [];

                chartSpec.autosize = { type: "fit-y", contains: "padding" };
                chartSpec.width = 600;

                return (
                  <Box sx={{
                    border: "1px solid #ccc",
                    borderRadius: "12px",
                    padding: "12px",
                    backgroundColor: "#fff",
                    maxWidth: "100%",
                    overflowX: "hidden",
                    overflowY: "auto",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
                    marginTop: "12px",
                  }}>
                    {/* Tabs + Download Button */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 0,
                      }}
                    >
                      <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ minHeight: 0, height: 36 }}
                        TabIndicatorProps={{ style: { height: 2 } }}
                      >
                        <Tab
                          label="Chart"
                          value="chart"
                          sx={{
                            minHeight: 0,
                            height: 36,
                            textTransform: "none",
                            fontWeight: 600,
                            border: "1px solid #ccc",
                            borderRadius: "8px 8px 0 0",
                            backgroundColor: "#f5f5f5",
                            boxShadow: activeTab === "chart" ? "0px 2px 4px rgba(0,0,0,0.1)" : "none",
                            marginRight: 1,
                          }}
                        />
                        <Tab
                          label="Table"
                          value="table"
                          sx={{
                            minHeight: 0,
                            height: 36,
                            textTransform: "none",
                            fontWeight: 600,
                            border: "1px solid #ccc",
                            borderRadius: "8px 8px 0 0",
                            backgroundColor: "#f5f5f5",
                            boxShadow: activeTab === "table" ? "0px 2px 4px rgba(0,0,0,0.1)" : "none",
                          }}
                        />
                      </Tabs>

                      {/* Show button only when table tab is active */}
                      {activeTab === "table" && chartData.length > 0 && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => downloadCSV(chartData, chartFields)}
                          sx={{ height: 30 }}
                        >
                          Download CSV
                        </Button>
                      )}
                    </Box>

                    <Box sx={{ borderBottom: "1px solid #ccc", marginBottom: 2 }} />

                    {/* Chart View */}
                    {activeTab === "chart" && (
                      <Box sx={{ width: "100%", overflowX: "auto" }}>
                        <Box
                          sx={{
                            minWidth: "600px",
                            width: chartSpec.width ? `${chartSpec.width}px` : "100%",
                            paddingBottom: "8px",
                          }}
                        >
                          <VegaLite spec={chartSpec} />
                        </Box>
                      </Box>
                    )}

                    {/* Table View */}
                    {activeTab === "table" && chartData.length > 0 && (
                      <Box sx={{ minWidth: "600px", width: "100%" }}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: "8px",
                            fontSize: "0.875rem",
                            backgroundColor: "#fff",
                          }}
                        >
                          <thead>
                            <tr>
                              {chartFields.map((field) => (
                                <th
                                  key={field}
                                  style={{
                                    textAlign: "left",
                                    padding: "6px 8px",
                                    borderBottom: "1px solid #ddd",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {field.replace(/_/g, " ")}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {chartData.map((row, index) => (
                              <tr key={index}>
                                {chartFields.map((field) => (
                                  <td
                                    key={field}
                                    style={{
                                      padding: "6px 8px",
                                      borderBottom: "1px solid #eee",
                                      fontSize: "0.875rem",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {row[field]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    )}
                  </Box>
                );
              })()}
            </Box>
          </div>
        )}
      </div>
    </div>
  );
};


export default MessageWithFeedback;

Feedback.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string,
    type: PropTypes.string,
    fromUser: PropTypes.bool,
    summarized: PropTypes.bool,
    streaming: PropTypes.bool,
    showExecute: PropTypes.bool,
    showSummarize: PropTypes.bool,
    showFeedback: PropTypes.bool,
    fdbck_id: PropTypes.string,
    session_id: PropTypes.string,
  }).isRequired,
};

MessageWithFeedback.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    type: PropTypes.oneOf(["text", "sql", "table"]),
    fromUser: PropTypes.bool,
    summarized: PropTypes.bool,
    streaming: PropTypes.bool,
    showExecute: PropTypes.bool,
    showSummarize: PropTypes.bool,
    interpretation: PropTypes.string,
    showFeedback: PropTypes.bool,
    sql: PropTypes.string,
    sqlQuery: PropTypes.string,
    executedResponse: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.object),
      PropTypes.object,
      PropTypes.string,
    ]),
  }).isRequired,
  executeSQL: PropTypes.func.isRequired,
  apiCortex: PropTypes.func.isRequired,
  handleGraphClick: PropTypes.func,
};
