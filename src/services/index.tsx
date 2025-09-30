// import axios from "axios";
// import { config } from "../hooks/config";

// interface QueryOverrides {
//   database_nm?: string;
//   schema_nm?: string;
//   session_id?: string;
//   [key: string]: any;
// }

// const buildPayload = (overrides: QueryOverrides = {}) => {
//   const { APP_CONFIG } = config();
//   const { APP_ID, API_KEY, DATABASE_NAME, SCHEMA_NAME, APP_LVL_PREFIX } = APP_CONFIG;

//   const safeOverrides = Object.fromEntries(
//     Object.entries(overrides).filter(([, val]) => val !== undefined)
//   );

//   const query = {
//     ...safeOverrides,
//     app_id: APP_ID,
//     api_key: API_KEY,
//     app_lvl_prefix: APP_LVL_PREFIX,
//   };

//   return { query };
// };

// const ApiService = {
//   getCortexSearchDetails: async ({
//     aplctn_cd, database_nm, schema_nm, session_id
//   }: QueryOverrides) => {
//     try {
//       const { API_BASE_URL, ENDPOINTS } = config();
//       const payload = buildPayload({ aplctn_cd, database_nm, schema_nm, session_id });

//       const response = await axios.post(
//         `${API_BASE_URL}${ENDPOINTS.CORTEX_SEARCH}/`,
//         payload
//       );

//       return response.data;
//     } catch (error) {
//       console.error("Error fetching cortex search details:", error);
//       throw error;
//     }
//   },

//   getCortexAnalystDetails: async ({
//     aplctn_cd, database_nm, schema_nm, session_id
//   }: QueryOverrides) => {
//     try {
//       const { API_BASE_URL, ENDPOINTS } = config();
//       const payload = buildPayload({ aplctn_cd, database_nm, schema_nm, session_id });

//       const response = await axios.post(
//         `${API_BASE_URL}${ENDPOINTS.CORTEX_ANALYST}/`,
//         payload
//       );

//       return response.data;
//     } catch (error) {
//       console.error("Error fetching cortex analyst details:", error);
//       throw error;
//     }
//   },
// };

// export default ApiService;


import axios from "axios";
import { config } from "../hooks/config";

interface QueryOverrides {
  database_nm?: string;
  schema_nm?: string;
  session_id?: string;
  aplctn_cd?: string;
  [key: string]: any;
}

const buildPayload = (
  overrides: QueryOverrides = {},
  appLvlPrefix: string,
  selectedAppId: string
) => {
  const { APP_CONFIG } = config("", selectedAppId, appLvlPrefix);
  const { APP_ID, API_KEY, APP_LVL_PREFIX } = APP_CONFIG;

  const safeOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([, val]) => val !== undefined)
  );

  return { query: { ...safeOverrides, app_id: APP_ID, api_key: API_KEY, app_lvl_prefix: APP_LVL_PREFIX } };
};

const ApiService = {
  getCortexSearchDetails: async (
    overrides: QueryOverrides,
    environment: string,
    selectedAppId: string,
    appLvlPrefix: string
  ) => {
    try {
    const { API_BASE_URL, ENDPOINTS } = config(environment, selectedAppId, appLvlPrefix);
    const payload = buildPayload(overrides, appLvlPrefix, selectedAppId);
    const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.CORTEX_SEARCH}/`, payload);
    return response.data;
    } catch (error) {
      console.error("Error fetching cortex search details:", error);
      throw error;
    }
  },

  getCortexAnalystDetails: async (
    overrides: QueryOverrides,
    environment: string,
    selectedAppId: string,
    appLvlPrefix: string
  ) => {
    try {
    const { API_BASE_URL, ENDPOINTS } = config(environment, selectedAppId, appLvlPrefix);
    const payload = buildPayload(overrides, appLvlPrefix, selectedAppId);
    const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.CORTEX_ANALYST}/`, payload);
    return response.data;
     } catch (error) {
      console.error("Error fetching cortex analyst details:", error);
      throw error;
    }
  },
};

export default ApiService;
