import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import ApiService from "../../services/index";
import MainContent from "../MainContent";
import axios from "axios";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
import BarChartIcon from "@mui/icons-material/BarChart";
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useApiRequest } from "../../hooks/useApiRequest";
import { useStreamHandler } from "../../hooks/useStreamHandler";
import { buildPayload } from "../../utils/buildPayload";
import { renderTextWithCitations } from "../../utils/renderTextWithCitations";
import { config } from "../../hooks/config";
import { MessageType } from "../../types/message.types";
import { v4 as uuidv4 } from "uuid";
import { useSelectedApp } from "../../components/SelectedAppContext";
import { HomeContentProps } from "interface";

interface SelectedModelState {
    yaml: string[];
    search: string[];
}

interface AnchorElState {
    account: HTMLElement | null;
    chat: HTMLElement | null;
    search: HTMLElement | null;
    upload: HTMLElement | null;
    schema: HTMLElement | null;
    environment: HTMLElement | null;

}


interface StreamEvent {
    event: string
    data: any
}

interface Message {
    id: string
    type: "user" | "assistant"
    content: string
    thinking?: string
    sql?: string
    isStreaming?: boolean
    showDetails?: boolean
    chart?: any;
    fromUser: boolean;
}


const HomeContent = ({ isReset, promptValue, recentValue, isLogOut, setCheckIsLogin }: HomeContentProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const toggleSidebar = () => setCollapsed((prev) => !prev);
    const [inputValue, setInputValue] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const { sendRequest } = useApiRequest();
    const [messages, setMessages] = useState<MessageType[]>([]);

    const { handleStream } = useStreamHandler(setMessages);
    const [data, setData] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [storedPrompt, setStoredPrompt] = useState<string>("");
    const [sessionId] = useState(() => uuidv4());
    const { selectedAppId, setSelectedAppId, environment, setEnvironment, appLvlPrefix, setAppLvlPrefix, dbDetails, setDbDetails } = useSelectedApp();
    const { APP_CONFIG, API_BASE_URL, ENDPOINTS } = config(environment, selectedAppId, appLvlPrefix);
    const { APP_ID, API_KEY, DEFAULT_MODEL, APP_NM, DATABASE_NAME, SCHEMA_NAME, APP_LVL_PREFIX } = APP_CONFIG;
    const [user_nm, setUserNm] = useState("");
    const [user_pwd, setUserPwd] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [anchorEls, setAnchorEls] = useState<AnchorElState>({
        account: null,
        chat: null,
        search: null,
        upload: null,
        schema: null,
        environment: null,

    });
    const open = Boolean(anchorEls.upload);
    const [fileLists, setFileLists] = useState<{ yaml: string[]; search: string[] }>({
        yaml: [],
        search: [],
    });
    const [selectedModels, setSelectedModels] = useState<SelectedModelState>({
        yaml: [],
        search: [],
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [vegaChartData, setVegaChartData] = useState<any>(null);
    const aplctnCdValue =
        selectedAppId === "POCGENAI"
            ? "edagnai"
            : selectedAppId.toLowerCase();
    
              const [agentPresent, setAgentPresent] = useState<string>("")
  const [selectedAgent, setSelectedAgent] = useState<string>("")

    useEffect(() => {
        setDbDetails((prev) => ({
            ...prev,
            schema_nm: "",
        }));
        setSelectedModels({ yaml: [], search: [] });
    }, [environment, appLvlPrefix]);

      useEffect(() => {
    console.log("[v0] HomeContent - agentPresent changed:", agentPresent)
  }, [agentPresent])

  useEffect(() => {
    console.log("[v0] HomeContent - selectedAgent changed:", selectedAgent)
  }, [selectedAgent])

    const handleMenuClick = (e: React.MouseEvent<HTMLElement>, type: keyof AnchorElState) => {
        const target = e.currentTarget as HTMLElement;
        if (type === "upload") {
            if (anchorEls.upload === target) {
                handleMenuClose();
            } else {
                setAnchorEls((prev) => ({ ...prev, upload: target as HTMLElement }));
            }
        } else {
            setAnchorEls((prev) => ({ ...prev, [type]: target }));
        }
    };
    const handleMenuClose = () =>
        setAnchorEls({
            account: null, chat: null, search: null, upload: null, schema: null, environment: null
        });
    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) setSelectedFile(file); };
    const handleModelSelect = (file: string, type: keyof SelectedModelState) => {
        setSelectedModels((prev) => ({
            ...prev,
            [type]: prev[type as keyof SelectedModelState].includes(file)
                ? prev[type as keyof SelectedModelState].filter((f) => f !== file)
                : [...prev[type as keyof SelectedModelState], file],
        }));
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setInputValue(e.target.value);



    // ***new streaming code ****

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const parseStreamEvent = (line: string): StreamEvent | null => {
        if (line.startsWith("event: ")) {
            const event = line.substring(7)
            return { event, data: null }
        }
        if (line.startsWith("data: ")) {
            try {
                const data = JSON.parse(line.substring(6))
                return { event: "data", data }
            } catch (e) {
                return { event: "data", data: line.substring(6) }
            }
        }
        return null
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedFile) {
            await handleUpload("data");
            return;
        }

        if (!inputValue.trim() || isLoading) return;

           console.log("[v0] handleSubmit - Current state:")
    console.log("[v0] - agentPresent:", agentPresent)
    console.log("[v0] - selectedAgent:", selectedAgent)
    console.log("[v0] - dbDetails:", dbDetails)
    console.log("[v0] - selectedModels:", selectedModels)

        const userMessage = {
            id: `user-${Date.now()}`,
            type: "user" as const,
            fromUser: true,
            content: inputValue.trim(),
            thinking: "",
            isStreaming: false,
        };

        setMessages((prev) => [...prev, userMessage]);

        const assistantMessage = {
            id: `assistant-${Date.now()}`,
            type: "assistant" as const,
            fromUser: false,
            content: "",
            thinking: "",
            isStreaming: true,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        console.log("home content", messages);
        setInputValue("");
        setIsLoading(true);
        setSubmitted(true);

        try {
            await simulateStreamingResponse(assistantMessage.id, userMessage.content);
        } catch (error) {
            console.error("Streaming error:", error);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            content: "Error occurred while processing your request.",
                            isStreaming: false,
                            fromUser: false,
                        }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitWrapper = () => { handleSubmit(new Event("submit") as any); };

    const simulateStreamingResponse = async (messageId: string, userInput: string) => {

        console.log("[v0] ========== simulateStreamingResponse START ==========")
    console.log("[v0] Agent Present:", agentPresent, "| Type:", typeof agentPresent, "| Length:", agentPresent?.length)
    console.log(
      "[v0] Selected Agent:",
      selectedAgent,
      "| Type:",
      typeof selectedAgent,
      "| Length:",
      selectedAgent?.length,
    )
    console.log("[v0] Trimmed agentPresent:", agentPresent?.trim())
    console.log("[v0] Lowercase agentPresent:", agentPresent?.trim().toLowerCase())
    console.log("[v0] Condition parts:")
    console.log("[v0]   - agentPresent?.trim().toLowerCase() === 'yes':", agentPresent?.trim().toLowerCase() === "yes")
    console.log("[v0]   - selectedAgent?.trim():", selectedAgent?.trim())
    console.log("[v0]   - !!selectedAgent?.trim():", !!selectedAgent?.trim())
    console.log("[v0] Final condition result:", agentPresent?.trim().toLowerCase() === "yes" && !!selectedAgent?.trim())

        // Build the payload using your existing buildPayload utility
        // const payload = buildPayload({
        //     prompt: userInput,
        //     semanticModel: selectedModels.yaml,
        //     searchModel: selectedModels.search,
        //     model: DEFAULT_MODEL,
        //     sessionId,
        //     selectedAppId,
        //     database_nm: dbDetails.database_nm,
        //     schema_nm: dbDetails.schema_nm,
        //     app_lvl_prefix: appLvlPrefix,
        //     // stage_nm: dbDetails.stage_nm,
        // });

        // // Use your configured endpoint
        // const endpoint = ENDPOINTS.AGENT
        //     ? `${API_BASE_URL}${ENDPOINTS.AGENT}`
        //     : `${API_BASE_URL}${ENDPOINTS.TEXT_TO_SQL}`;

        let payload: any
    let endpoint: string

 if (agentPresent?.trim().toLowerCase() === "yes" && selectedAgent?.trim()) {  
        console.log("[v0] ✅ Using AGENT_WO_RUN endpoint")  
      payload = {
        query: {
          aplctn_cd: aplctnCdValue,
          app_id: APP_ID,
          api_key: API_KEY,
          app_lvl_prefix: appLvlPrefix,
          session_id: sessionId,
          database_nm: dbDetails.database_nm,
          schema_nm: dbDetails.schema_nm,
          agent_nm: selectedAgent,
          thread_id: 0,
          parent_message_id: 0,
          prompt: {
            messages: [
              {
                role: "user",
                content: userInput,
              },
            ],
          },
          tool_choice: {},
        },
      }
      endpoint = `${API_BASE_URL}${ENDPOINTS.AGENT_WO_RUN}`
    } else {
          console.log("[v0] ❌ Using default agent_v2 endpoint (condition failed)")
      payload = buildPayload({
        prompt: userInput,
        semanticModel: selectedModels.yaml,
        searchModel: selectedModels.search,
        model: DEFAULT_MODEL,
        sessionId,
        selectedAppId,
        database_nm: dbDetails.database_nm,
        schema_nm: dbDetails.schema_nm,
        app_lvl_prefix: appLvlPrefix,
      })
      endpoint = ENDPOINTS.AGENT ? `${API_BASE_URL}${ENDPOINTS.AGENT}` : `${API_BASE_URL}${ENDPOINTS.TEXT_TO_SQL}`
    }
 console.log("[v0] Final endpoint:", endpoint)
    console.log("[v0] Final payload:", JSON.stringify(payload, null, 2))
    console.log("[v0] ========== simulateStreamingResponse END ==========")


        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
            throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "";
        let streamingThinking = "";
        let streamingText = "";
        let sqlContent = "";
        let finalThinking = "";
        let finalText = "";
        let chartSpec = ""

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                const parsed = parseStreamEvent(trimmedLine);
                if (!parsed) continue;

                if (parsed.event !== "data") {
                    currentEvent = parsed.event;
                    continue;
                }

                const data = parsed.data;

                switch (currentEvent) {
                    case "response.thinking.delta":
                        if (data.text) {
                            streamingThinking += data.text;
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === messageId
                                        ? { ...msg, thinking: streamingThinking }
                                        : msg
                                )
                            );
                        }
                        break;

                    case "response.thinking":
                        finalThinking = data.text;
                        break;

                    case "response.tool_result":
                        // if (data.content?.[0]?.json?.sql) {
                        //   sqlContent = data.content[0].json.sql;
                        // }
                        if (data.content?.[0]?.json?.sql) {
                            sqlContent = data.content[0].json.sql;
                        }

                        if (data.content[0].json.charts && data.content[0].json.charts.length > 0) {
                            chartSpec = data.content[0].json.charts[0];
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === messageId
                                        ? { ...msg, chart: chartSpec, sql: sqlContent }
                                        : msg
                                )
                            );
                        }

                        break;

                    case "response.text.delta":
                        if (data.text) {
                            streamingText += data.text;
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === messageId && msg.type === "assistant"
                                        ? { ...msg, content: streamingText, sql: sqlContent }
                                        : msg
                                )
                            );
                        }
                        break;



                    case "response.text":
                        if (data.text) {
                            if (finalText.length > 0) {
                                finalText += "\n";
                            }
                            finalText += data.text;
                        }
                        break;


                    case "response":
                        if (data.content) {
                            const thinkingContent = data.content.find((item: any) => item.type === "thinking");
                            const textContent = data.content.find((item: any) => item.type === "text");

                            //   setMessages((prev) =>
                            //     prev.map((msg) =>
                            //       msg.id === messageId
                            //         ? {
                            //             ...msg,
                            //             thinking: thinkingContent?.thinking?.text || finalThinking,
                            //             content: textContent?.text || finalText,
                            //             sql: sqlContent,
                            //             isStreaming: false,
                            //             showDetails: false,
                            //           }
                            //         : msg
                            //     )
                            //   );
                            const chartContent = data.content.find((item: any) => item.type === "chart");
                            if (chartContent?.chart?.chart_spec) {
                                chartSpec = chartContent.chart.chart_spec;
                            }

                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === messageId
                                        ? {
                                            ...msg,
                                            thinking: thinkingContent?.thinking?.text || finalThinking,
                                            content: finalText,
                                            sql: sqlContent,
                                            chart: chartSpec,
                                            isStreaming: false,
                                            showDetails: false,
                                        }
                                        : msg
                                )
                            );

                        }
                        return;

                    case "done":
                        return;
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        }
    };

    const handleUpload = async (
        type: "yaml" | "data",
        triggerFileDialog: boolean = false,
    ): Promise<void> => {
        handleMenuClose();

        if (triggerFileDialog) {
            fileInputRef.current?.click();
            return;
        }

        if (type === "data") {
            if (!selectedFile) {
                return;
            }

            setIsUploading(true);
            const formData = new FormData();

            const query = {
                aplctn_cd: aplctnCdValue,
                app_id: APP_ID,
                api_key: API_KEY,
                app_nm: APP_NM,
                app_lvl_prefix: APP_LVL_PREFIX,
                session_id: sessionId,
            };

            formData.append("query", JSON.stringify(query));
            formData.append("files", selectedFile);

            try {
                const response = await axios.post(
                    `${API_BASE_URL}${ENDPOINTS.UPLOAD_URL}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    },
                );

                const successMessage = response?.data?.message || "File uploaded successfully!";
                toast.success(successMessage, { position: "top-right" });
                setSelectedFile(null);
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Upload failed. Please try again.", { position: "top-right" });
            } finally {
                setIsUploading(false);
            }
        } else if (type === "yaml") {
            window.open(
                "https://app.snowflake.com/carelon/eda_preprod/#/data/databases/POC_SPC_SNOWPARK_DB/schemas/HEDIS_SCHEMA/stage/HEDIS_STAGE_FULL",
                "_blank",
            );
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        handleUpload("data");
    };

    //   const executeSQL = async (sqlQuery: any) => {
    //     console.log(sqlQuery);
    //     setIsLoading(true);

    //     const payload = buildPayload({
    //       prompt: storedPrompt,
    //       execSQL: sqlQuery.sqlQuery,
    //       sessionId,
    //       minimal: true,
    //       selectedAppId,
    //       user_nm,
    //       user_pwd,
    //       database_nm: dbDetails.database_nm,
    //       schema_nm: dbDetails.schema_nm,
    //       app_lvl_prefix: appLvlPrefix,
    //     });
    //     const { data, error } = await sendRequest(
    //       `${API_BASE_URL}${ENDPOINTS.RUN_SQL_QUERY}`,
    //       payload,
    //     );
    //     if (error || !data) {
    //      setMessages((prev) => [
    //   ...prev,
    //   {
    //     id: Date.now().toString(),
    //     type: "assistant",
    //     text: "Error communicating with backend.",
    //     fromUser: false,
    //     showExecute: false,
    //     showSummarize: false,
    //   },
    // ]);

    //       console.error("Error:", error);
    //       setIsLoading(false);
    //       return;
    //     }

    //     const convertToString = (input: any): string => {
    //       if (input === null || input === undefined) return "";
    //       if (typeof input === "string") return input;
    //       if (Array.isArray(input)) return input.map(convertToString).join(", ");
    //       if (typeof input === "object")
    //         return Object.entries(input)
    //           .map(([k, v]) => `${k}: ${convertToString(v)}`)
    //           .join(", ");
    //       return String(input);
    //     };
    //     let modelReply: string | React.ReactNode = "";
    //     modelReply = typeof data === "string" ? data : convertToString(data);
    //     setData(data);
    //     handleVegaLiteRequest(sqlQuery.prompt, sqlQuery.sqlQuery)
    //     console.log(data);
    //     setMessages((prev) => [
    //       ...prev,
    //       {
    //        id: Date.now().toString(),
    //     type: "assistant",
    //     text: modelReply,
    //     fromUser: false,
    //     executedResponse: data,
    //     messageType: "table",
    //     showExecute: false,
    //     showSummarize: true,
    //     prompt: sqlQuery.prompt,
    //       },
    //     ]);
    //     setIsLoading(false);
    //   };

    // const apiCortex = async (message: any) => {
    //   console.log(message);
    //   setIsLoading(true);
    //   setMessages((prev) =>
    //     prev.map((msg) => {
    //       const isSameResponse =
    //         JSON.stringify(msg.executedResponse) === JSON.stringify(message.executedResponse);

    //       if (msg.fromUser === false && msg.showSummarize && isSameResponse) {
    //         return { ...msg, showSummarize: false };
    //       }
    //       return msg;
    //     }),
    //   );

    //   const payload = buildPayload({
    //     method: "cortex",
    //     model: "llama3.1-70b",
    //     prompt: storedPrompt,
    //     sysMsg:
    //       "You are powerful AI assistant in providing accurate answers always. Be Concise in providing answers based on context.",
    //     responseData: message.executedResponse,
    //     sessionId,
    //     selectedAppId,
    //     app_lvl_prefix: appLvlPrefix,

    //   });

    //   const { stream, error } = await sendRequest(
    //     `${API_BASE_URL}${ENDPOINTS.CORTEX_COMPLETE}`,
    //     payload,
    //     undefined,
    //     true,
    //   );

    //   if (!stream || error) {
    //     console.error("Streaming error:", error);
    //     setMessages((prev) => [
    //       ...prev,
    //       { text: "An error occurred while summarizing.", fromUser: false },
    //     ]);
    //     setIsLoading(false);
    //     return;
    //   }

    //   let streamedText = "";

    //   await handleStream(stream, {
    //     fromUser: false,
    //     streaming: true,
    //     onToken: (token: string) => {
    //       const endIndex = token.indexOf("end_of_stream");
    //       if (endIndex !== -1) {
    //         token = token.substring(0, endIndex);
    //       }

    //       if (token) {
    //         streamedText += token;
    //         setMessages((prev) => {
    //           const updated = [...prev];
    //           const lastIndex = updated.length - 1;
    //           if (lastIndex >= 0 && updated[lastIndex].streaming) {
    //             updated[lastIndex] = {
    //               ...updated[lastIndex],
    //               text: streamedText,
    //             };
    //           } else {
    //             updated.push({
    //               text: token,
    //               fromUser: false,
    //               streaming: true,
    //               type: "text",
    //               showSummarize: false,
    //               prompt: message.prompt,
    //               fdbck_id: message.fdbck_id,
    //               session_id: message.session_id,
    //             });
    //           }
    //           return updated;
    //         });
    //       }
    //     },
    //     onComplete: (response: any) => {
    //       setMessages((prev) =>
    //         prev.map((msg) => {
    //           const isSameResponse =
    //             JSON.stringify(msg.executedResponse) === JSON.stringify(message.executedResponse);

    //           if (msg.fromUser === false && msg.showSummarize && isSameResponse) {
    //             return {
    //               ...msg,
    //               streaming: false,
    //               summarized: true,
    //               showSummarize: false,
    //               showFeedback: true,
    //               fdbck_id: response.fdbck_id,
    //               session_id: response.session_id,
    //             };
    //           }
    //           return msg;
    //         }),
    //       );
    //       setIsLoading(false);
    //     },
    //   });
    // };

    // const handleVegaLiteRequest = async (promptText: any, sqlQuery: any) => {
    //   const payload = buildPayload({
    //     selectedAppId,
    //     sessionId,
    //     prompt: promptText,
    //     execSQL: sqlQuery,
    //     minimal: true,
    //     user_nm,
    //     user_pwd,
    //     database_nm: dbDetails.database_nm,
    //     schema_nm: dbDetails.schema_nm,
    //     app_lvl_prefix: appLvlPrefix,

    //   });

    //   try {
    //     const response = await axios.post(
    //       `${API_BASE_URL}${ENDPOINTS.GET_VEGALITE_JSON}`,
    //       payload,
    //       // {
    //       //   headers: {
    //       //     "Content-Type": "application/json",
    //       //   },
    //       // }
    //     );
    //     if (response.status === 200 && response.data) {
    //       setVegaChartData(response.data);
    //     } else {
    //       console.error("Failed to generate Vega-Lite chart.");
    //     }
    //   } catch (err) {
    //     console.error("VegaLite API error:", err);
    //   }
    // };

    useEffect(() => {
        const anchor = document.getElementById("scroll-anchor");
        if (anchor) anchor.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleReset = () => {
        setInputValue("");
        setMessages([]);
        setSubmitted(false);
        setData(null);
        setSelectedFile(null);
        setIsUploading(false);
        setIsLoading(false);
        setStoredPrompt("");
        if (isReset) {
            setDbDetails({ database_nm: "", schema_nm: "" });
        }
    };

    useEffect(() => {
        handleReset();
    }, [isReset]);

    useEffect(() => {
        const InputVal = promptValue ? promptValue : "";
        setInputValue(InputVal);
    }, [promptValue]);

    useEffect(() => {
        if (recentValue) {
            /** Recent code flow will come here */
        }
    }, [recentValue]);

    const toggleDetails = (messageId: string) => {
        setMessages((prev) =>
            prev.map((msg) => (msg.id === messageId ? { ...msg, showDetails: !msg.showDetails } : msg)),
        );
    };

    return (
        <MainContent
            collapsed={collapsed}
            toggleSidebar={toggleSidebar}
            inputValue={inputValue}
            messages={messages}
            anchorEls={anchorEls}
            fileLists={fileLists}
            setFileLists={setFileLists}
            selectedModels={selectedModels}
            handleMenuClick={handleMenuClick}
            handleMenuClose={handleMenuClose}
            handleModelSelect={handleModelSelect}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmitWrapper}
            isLoading={isLoading}
            fileInputRef={fileInputRef}
            selectedFile={selectedFile}
            isUploading={isUploading}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
            data={data}
            setSelectedFile={setSelectedFile}
            // executeSQL={executeSQL}
            // apiCortex={apiCortex}
            submitted={submitted}
            setSubmitted={setSubmitted}
            open={open}
            dbDetails={dbDetails}
            setDbDetails={setDbDetails}
            user_nm={user_nm}
            user_pwd={user_pwd}
            setUserNm={setUserNm}
            setUserPwd={setUserPwd}
            setCheckIsLogin={setCheckIsLogin}
            isLogOut={isLogOut}
            vegaChartData={vegaChartData}
            setVegaChartData={setVegaChartData}
            isReset={isReset}
            toggleDetails={toggleDetails}
             agentPresent={agentPresent}
      setAgentPresent={setAgentPresent}
      selectedAgent={selectedAgent}
      setSelectedAgent={setSelectedAgent}
        />
    );
};


export default HomeContent;
