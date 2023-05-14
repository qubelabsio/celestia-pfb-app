import axios from "axios";

const DEFAULT_NODE_ID = "http://144.76.105.14:26659";

const handler = async (event) => {
  // TODO implement
  console.log("Event ", event);
  const body = JSON.parse(event.body);

  try {
    const nodeID = body.nodeId || DEFAULT_NODE_ID;
    const nodeUrl = `${nodeID}/submit_pfb`;
    
    console.log("URL ", nodeUrl);
    const data = JSON.stringify({
      namespace_id: body.namespace_id,
      data: body.data,
      gas_limit: body.gas_limit,
      fee: body.fee,
    });
    
    const config = {
      method: "post",
      url: nodeUrl,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    
    const resp = await axios(config);
    console.log("Response ", resp.data);
    
    const response = {
      statusCode: 200,
      body: JSON.stringify(resp.data),
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

export default handler;
