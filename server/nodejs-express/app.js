import express from 'express';
import cors from 'cors';

import getShares from "./components/get-shares.js";
import submitPfb from "./components/submit-pfb.js";

const app = express()
const port = 8080


app.use(express.json());
app.use(cors());

app.use(function (req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
  next();
});

app.get('/node-status', async (req, res) => {
  console.log("GET Node status invoked");

  try {
    const nodeID = req.query.nodeID;
    const resp = await getShares({
      queryStringParameters: {
        nodeID
      }
    });

    console.log("Success: Node status ", resp);
    return res.status(200).send({statusCode: resp.statusCode, body: JSON.parse(resp.body)});
  } catch (error) {
    console.log("Failure: Node status ", error);
    return res.status(500).send(error);
  }
})

app.post('/submit-pfb', async (req, res) => {
  console.log("POST Submit PFB invoked");
  try {
    const resp = await submitPfb({
      body: JSON.stringify({
        namespace_id: req.body.namespace_id,
        data: req.body.data,
        gas_limit: req.body.gas_limit,
        fee: req.body.fee,
        nodeID: req.body.nodeID
      })
    });

    console.log("Success: Submit PFB ", resp);
    return res.status(200).send({...JSON.parse(resp.body)});
  } catch (error) {
    console.log("Failure: Submit PFB ", error);
    return res.status(500).send(error);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})