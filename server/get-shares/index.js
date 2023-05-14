import axios from "axios";

const DEFAULT_NODE_ID = "http://144.76.105.14:26659";

export const handler = async (event) => {
  // TODO implement
  console.log("Event ", event);
  const {queryStringParameters} = event;

  try {
    const nodeID = queryStringParameters.nodeID || DEFAULT_NODE_ID;
    
    const config = {
      method: 'get',
      url: `${nodeID}/balance`,
      headers: { }
    };
    
    const resp = await axios(config);
    console.log("Response ", resp.data);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        ...resp.data
      }),
    };
    return response;
  } catch (error) {
    console.log("Error ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message || "Internal Server Error"
      }),
    };
  }
};
