import React, { useRef, useState, useEffect } from "react";
import Tooltip from "../services/Tooltip";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BsFillCircleFill } from 'react-icons/bs'
import { TbExternalLink } from 'react-icons/tb'

import { ColorRing } from "react-loader-spinner";
import { DEFUALT_NODE_IP, LEMBDA_HOST_URL } from "../config/app.config";
import moment from "moment";

import clelestiaLogo from "../images/celestia-logo.png"
import githubLogo from "../images/ghlogo.png"


const Celestia = () => {
  const [nameSpaceId, setNameSpaceId] = useState('')
  const nameSpaceIdRef = useRef(null);

  const [nodeIP, setNodeIP] = useState()
  const nodeIPRef = useRef(DEFUALT_NODE_IP);
  const messageDataRef = useRef(null);
  const [fee, setFee] = useState(2000)
  const feeRef = useRef(2000);
  const [gasLimit, setGasLimit] = useState(80000)
  const gasLimitRef = useRef(80000);
  const [nodeActiveStatus, setNodeActiveStatus] = useState(2)  //0= inactive, 1=active, 2=null

  const [loading, setLoading] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [display, setDisplay] = useState(false);
  const [result, setResult] = useState(null);

  const [response, setResponse] = useState({});
  const [payload, setPayload] = useState({});
  const [shareMsg, setShareMsg] = useState({});
  const [responseStatus, setResponseStatus] = useState('');

  const [activeItem, setActiveItem] = useState("info");
  const [formattedDate, setFormattedDate] = useState('')


  const [errorInNameSpace, setErrorInNameSpace] = useState({
    isError: false,
    errorMessage: ''
  });

  const [selectedOption, setSelectedOption] = useState('Default');

  //change toogle in nodeip
  const handleOptionChange = (event) => {
    // setSelectedOption(event.target.value);

    setSelectedOption(event);

  };


  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  // convert string into haxdecimal
  function stringToHex(str) {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex;
  }

  // api for checking status of node ip
  const statusCheckApi = async (nodeIdString) => {
    let status;

    if(!nodeIdString.includes("http://")){
      nodeIdString = "http://"+nodeIdString;
    }

    try {
      const resp = await axios.get(`${LEMBDA_HOST_URL}/node-status?nodeId=${nodeIdString}`)
      status=resp?.status
    } catch (error) {
      if (error?.response?.status) {
        status=error?.response?.status
      }
    }
    return status
  }


  useEffect(() => {
    async function fetchData() {
      const status = await statusCheckApi(DEFUALT_NODE_IP)
      if (status === 200) {
        setNodeActiveStatus(1)
      } else {
        toast.error('Node is not working properly')
        setNodeActiveStatus(0)
      }
    }
    fetchData()
  }, [])

  const submitData = async () => {
    setPayload({
      namespaceId: nameSpaceIdRef.current?.value || nameSpaceId,
      nodeId: nodeIPRef.current?.value,
      fee: feeRef.current?.value,
      gasLimit: gasLimitRef.current?.value,
      messageData: messageDataRef?.current?.value,
    });

    try {
      let nodeId = nodeIPRef.current?.value || DEFUALT_NODE_IP;

      if(!nodeId.includes("http://")){
        nodeId = "http://"+nodeId;
      }

      let body = {
        fee: Number(feeRef.current?.value),
        gas_limit: Number(gasLimitRef.current?.value),
        data: stringToHex(messageDataRef.current?.value),
        namespace_id: nameSpaceIdRef.current?.value || nameSpaceId,
        nodeId

      };

      const status = await statusCheckApi(nodeId)
      if (status === 200) {
        setNodeActiveStatus(1)
      } else {
        toast.error('Node is not working properly')
        setNodeActiveStatus(0)
        return
      }

      let response = await axios.post(
        `${LEMBDA_HOST_URL}/submit-pfb`,
        body,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setResponseStatus(response?.status)
      if (response?.data?.gas_used > response?.data?.gas_wanted) {
        toast.error(response?.data.raw_log);
        return
      }

      const currentDate = moment().utc();
      const formattedDateValue = currentDate.format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
      setFormattedDate(formattedDateValue)
      setActiveItem('info')
      setResult({ success: true });
      setResponse(response?.data);

    } catch (error) {
      if (error?.response?.status) {
        setResponseStatus(error?.response?.status)
        // toast.error('The Node you entered is not accessible')
        setNodeActiveStatus(0)
        setResponse({})
        setResult({
          success: false,
          error: `The node you entered could not be reached, resulting in the error code "${error?.response?.status}"`
          // error: `Error with response code : ${error?.response?.status}`,
        });
        return
      }
      // toast.error('Node is not working properly')
      setNodeActiveStatus(0)
      setLoading(false);
      setResult({
        success: false,
        error: 'something went wrong',
      });
      return
    } finally {
      setLoading(false);
      setSubmit(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (
      nameSpaceIdRef.current?.value === "" ||
      gasLimitRef.current?.value === "" ||
      messageDataRef.current?.value === "" ||
      (selectedOption === 'Manual' && nodeIPRef.current?.value === "") ||
      feeRef.current?.value === ""
    ) {
      toast.error("Field can't be left Empty.");
      return;
    }
    const nameSpaceIdValue = nameSpaceIdRef.current
    if (nameSpaceId.length < 16) {
      toast.error("Name space is Hex and 16 characters long.");
      return
    }
    setSubmit(true);
    setDisplay(true);
  };

  useEffect(() => {
    if (submit) {
      setLoading(true);
      submitData();
    }
  }, [submit]);

  const generateNamespaceId = () => {
    let randomHex = Math.floor(Math.random() * 0xffffffffffffffff).toString(16).padStart(16, '0');
    setNameSpaceId(randomHex)
    nameSpaceIdRef.current = randomHex;
    // return randomHex
  }



  function isHexString(str) {
    // Regular expression for a valid hexadecimal string
    const hexRegex = /^[0-9a-fA-F]+$/;
    // Check if the string matches the regular expression
    return hexRegex.test(str);
  }

  const changeNameSpaceIdFunc = (e) => {
    let value = e.target.value;
    value = value.toLowerCase();
    if (!isHexString(value)) {
      setErrorInNameSpace({
        isError: true,
        errorMessage: 'NamespaceId is hexdecimal (0-9,a-f,A-F) and 16 characters long.',
      })
      return
    }
    else {
      setErrorInNameSpace({
        isError: false,
        errorMessage: ''
      })
    }

    setNameSpaceId(value)
  }
  // const currentDate = moment().utc();
  // const formattedDateValue = currentDate.format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
  // setFormattedDate(formattedDateValue)

  return (
    <section className="flex flex-col  max-w-[65%] mx-auto my-auto">
      <div className="text-center my-2">
        <div className="flex justify-center">
          <img className="w-24 h-24 md:w-36 md:h-36" src={clelestiaLogo} alt="Celestia" />
        </div>
        <h1 className="text-[28px] md:text-[45px] font-medium tracking-wide mb-2">Celestia PFB App</h1>
        <p className="text-[16px] md:text-[18px]">
          Celestia PFB App is an easy-to-use web application for submitting PayForBlob (PFB) transactions on the Celestia network.
        </p>
      </div>
      <div className="flex justify-end mt-12">
        <div className=" flex justify-center items-center">
          {
            nodeActiveStatus == 2 ? <div className="flex items-center ">
              {/* <span className="ml-2">Loading....</span> */}
              <ColorRing
                visible={true}
                height="20"
                width="20"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                colors={["#040404"]}
              />
            </div>
              // <span className="text-[16px] flex items-center"> <BsFillCircleFill className="text-red-500 mr-2" size={18} /> Node Offline</span>
              : nodeActiveStatus == 1 ? <span className="text-[16px]  flex items-center"> <BsFillCircleFill className="text-green-500 mr-2" size={18} /> Node Online</span>
                : <span className="text-[16px] flex items-center"> <BsFillCircleFill className="text-red-500 mr-2" size={18} />  Offline</span>

          }

        </div>
      </div>
      <div className="w-[100%] rounded-md px-6 py-3 mt-3 bg-[#FFFFFF] shadow-xl mb-4">
        <form onSubmit={submitHandler}>
          <div className="flex flex-col mt-3 ">
            <label htmlFor="namespaceId" className="text-sm font-semibold flex">
              <span className="pr-2">Namespace ID</span>
              <Tooltip text="Namespace is a 16 character HEX value." />
            </label>
            <div className="flex flex-col md:flex-row justify-between gap-1 mt-1">

              <input
                type="text"
                name="namespaceId"
                className=" px-2 py-2 w-full md:w-4/6 lg:w-5/6 text-sm bg-white border-[1px] border-[#DADADA] outline-none rounded-md"
                placeholder="Enter value or generate"
                value={nameSpaceId || ""}
                maxLength={16}
                // disabled
                onChange={changeNameSpaceIdFunc}
                ref={nameSpaceIdRef}
              />
              <div
                className="btn py-1  md:py-0 md:w-2/6 lg:w-1/6  font-medium flex justify-center items-center cursor-pointer  hover:border-red-200 border-2 rounded-md bg-black text-white "
                onClick={() => generateNamespaceId()}>
                <div className="text-[15px] lg:text-[16px]  text-center">Generate ID</div>
              </div>

            </div>
            {errorInNameSpace?.isError && <p className="text-red-600 text-[11px]">*{errorInNameSpace?.errorMessage}</p>}
          </div>

          <div className="flex flex-col mt-3">
            <label htmlFor="messageData" className="text-sm font-semibold flex">
              <span className="pr-2">Message Data</span>
              <Tooltip text="Data is in hex-encoded bytes." />
            </label>
            <textarea
              type="text"
              name="messageData"
              className="mt-1 px-2 py-2 text-sm bg-[#FFFFFF] border-[1px] border-[#DADADA] outline-none rounded-md"
              placeholder="Enter your message data"
              ref={messageDataRef}
            />
          </div>
          <div className="md:flex mt-1 items-center">
            <div className="flex flex-col mt-3 w-[100%]">
              <label htmlFor="fee" className="text-sm font-semibold flex">
                <span className="pr-2">Fee</span>
                <Tooltip text="The fee to use for the transaction." />
              </label>
              <input
                type="number"
                name="fee"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="mt-1 px-2 py-2 text-sm bg-[#FFFFFF] border-[1px] border-[#DADADA] outline-none rounded-md"
                placeholder="Fee"
                ref={feeRef}
              />
            </div>
            <div className="flex flex-col mt-3 w-[100%] md:ml-2">
              <label htmlFor="gasLimit" className="text-sm font-semibold flex">
                <span className="pr-2">Gas Limit</span>
                <Tooltip text="The max gas to use for the transaction." />
              </label>
              <input
                type="number"
                name="gasLimit"
                value={gasLimit}
                onChange={(e) => setGasLimit(e.target.value)}
                className="mt-1 px-2 py-2 text-sm bg-[#FFFFFF] border-[1px] border-[#DADADA] outline-none rounded-md"
                placeholder="Gas Limit"
                ref={gasLimitRef}
              />
            </div>
          </div>
          <div className="flex flex-col mt-3">
            <label htmlFor="nodeId" className="text-sm font-semibold flex" >
              <span
                className="pr-2 cursor-pointer"
              // onClick={() => handleOptionChange(selectedOption == "Manual" ? "Default" : "Manual")}

              >Node IP</span>
              <Tooltip text="Use default or enter manual API" />
            </label>

            {/* <div
              className="p-1 bg-black text-white w-[70px] text-[15px] text-center rounded-md cursor-pointer mt-1"
              onClick={() => handleOptionChange(selectedOption == "Manual" ? "Default" : "Manual")}
            >
              {selectedOption}
            </div> */}
            <label className="relative inline-flex items-center cursor-pointer my-4">
              
              <input type="checkbox" className="sr-only peer"
              // value='on'
                checked={selectedOption == "Manual"?true:false } 
                onClick={() => handleOptionChange(selectedOption == "Manual" ? "Default" : "Manual")}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"> {selectedOption}</span>
            </label>

            {/* <div className="flex mt-1">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="option"
                  value="Default"
                  checked={selectedOption === 'Default'}
                  onChange={handleOptionChange}
                  className="mr-1 "
                />
                <span>
                  Default
                </span>
              </label>
              <label className="mx-3 flex items-center">
                <input
                  type="radio"
                  name="option"
                  value="Manual"
                  checked={selectedOption === 'Manual'}
                  onChange={handleOptionChange}
                  className="mr-1 "

                />
                <span>
                  Manual
                </span>
              </label>
            </div> */}
            {selectedOption === 'Manual' && <div className="text-sm mb-1 text-gray-500">Enter in format of IP:PORT ( example <span className="text-gray-800">127.0.0.1:8080</span> )</div>}
            {selectedOption === 'Manual' &&
              <input
              type="text"
              name="nodeId"
              value={nodeIP}
              className="mt-1 px-2 py-2 text-sm bg-[#FFFFFF] border-[1px] border-[#DADADA] outline-none rounded-md"
              placeholder="Enter the Node IP"
              onChange={(e) => setNodeIP(e.target.value)}
              ref={nodeIPRef}
            />
            }
          </div>
          <button
            className="w-[100%] flex justify-center py-2 mt-4 mb-6 rounded-md bg-[#111111] font-semibold text-white"
            type="submit"
            disabled={submit}
          >
            Submit
          </button>
        </form>
      </div>
      <div>
        {display && (
          <div className="">
            <div className="text-2xl mb-4 flex items-center justify-center">
              Status:{" "}
              {loading ? (
                <div className="flex items-center ">
                  <span className="ml-2">Loading....</span>
                  <ColorRing
                    visible={true}
                    height="40"
                    width="40"
                    ariaLabel="blocks-loading"
                    wrapperStyle={{}}
                    wrapperClass="blocks-wrapper"
                    colors={["#040404"]}
                  />
                </div>
              ) : (

                <span className="ml-2">{response?.height ? 'Success' : 'Failed'}</span>

              )}
            </div>
            {!loading && result?.success && (
              <div className=" mb-4 border-[1px] bg-white border-gray-300 rounded-md">
                <div className="flex justify-around border-b border-gray-200 mt-2 overflow-x-auto scroll-m-0 ">
                  <button
                    className={`px-4 py-2  font-medium text-[18px] hover:text-gray-800${activeItem === "info"
                      ? "text-gray-800 border-b-2 border-gray-800 text-left"
                      : "text-gray-600 text-left"
                      }`}
                    onClick={() => handleItemClick("info")}
                  >
                    Transaction Details
                  </button>
                  <button
                    className={`px-4 py-2  font-medium text-[18px] hover:text-gray-800 ${activeItem === "data"
                      ? "text-gray-800 border-b-2 border-gray-800"
                      : "text-gray-600 text-left"
                      }`}
                    onClick={() => handleItemClick("data")}
                  >
                    Data
                  </button>
                  {/* <button
                    className={`py-2 px-4  font-medium text-[18px] hover:text-gray-800 ${activeItem === "txHash"
                      ? "text-gray-800 border-b-2 border-gray-800"
                      : "text-gray-600 text-left"
                      }`}
                    onClick={() => handleItemClick("txHash")}
                  >
                    Transaction hash
                  </button> */}

                </div>
                {activeItem === "info" &&
                  <div className="p-3 my-4">
                    <div className="flex  flex-wrap justify-between">
                      <div className="w-full md:w-1/2 lg:w-1/3 mb-3 md:mb-2">
                        <h2 className="font-medium text-[15px]">
                          Date and Time:
                        </h2>
                        <div className="font-medium text-gray-400  text-[15px]">
                          {response?.date || formattedDate || '-'}
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 lg:w-1/3 mb-3 md:mb-2">
                        <h2 className="font-medium text-[15px]">
                          Gas used:
                        </h2>
                        <div className="font-medium text-gray-400 text-[15px]">
                          {response?.gas_used || '-'}

                        </div>
                      </div>
                      {/* <div className="w-full md:w-1/2 lg:w-1/3 mb-3 md:mb-2">
                        <h2 className="font-medium text-[15px]">
                          Namespace ID:
                        </h2>
                        <div className="font-medium text-gray-400 text-[16px]">
                          {nameSpaceId || '-'}
                        </div>
                      </div> */}
                      <div className="w-full md:w-1/2 lg:w-1/3 mb-3 md:mb-2">
                        <h2 className="font-medium text-[15px]">
                          Height:
                        </h2>
                        <div className="font-medium text-gray-400 text-[15px]">
                          {response?.height || '-'}
                        </div>
                      </div>
                      {/* <div className="w-full md:w-1/2 lg:w-1/3 mb-3 md:mb-2">
                        <h2 className="font-medium text-[15px]">
                          Gas wanted:
                        </h2>
                        <div className="font-medium text-gray-400 text-[15px]">
                          {response?.gas_wanted || '-'}

                        </div>
                      </div> */}
                      {/* <div className="w-full md:w-1/2 lg:w-1/3 mb-3 md:mb-2">
                        <h2 className="font-medium text-[15px]">
                          Gas used:
                        </h2>
                        <div className="font-medium text-gray-400 text-[15px]">
                          {response?.gas_used || '-'}

                        </div>
                      </div> */}
                      {/* <div className="w-full md:w-1/2 lg:w-1/3 mb-3 md:mb-2">
                        <h2 className="font-medium text-[15px]">
                          Code:
                        </h2>
                        <div className="font-medium text-gray-400 text-[15px]">
                          {responseStatus || '-'}
                        </div>
                      </div> */}
                    <div className=" mt-3 mb-2 font-medium text-[15px] whitespace-pre-wrap break-words w-full ">

                      <h2 className="font-medium text-[15px]">
                          Transaction Link:
                      </h2>
                      <a href={` https://testnet.mintscan.io/celestia-incentivized-testnet/txs/${response?.txhash}`} target="_blank" className="text-[#7B2BF9] hover:underline cursor-pointer text-[15px]">

                        {response?.txhash}
                        <TbExternalLink size={25} className=" mx-1 hover:text-[40px] inline" />
                      </a>
                    </div>

                    </div>
                  </div>
                }
                {activeItem === "data" &&
                  <div className="md:p-3 mt-4">
                    <div className="mb-2">
                      <div className="font-medium mx-3 text-[15px] pt-3">
                        <div className="flex flex-wrap mb-1 w-full">
                          <div className="py-1 mb-1 w-full text-center md:w-3/12 md:mr-1 text-white bg-black rounded text-[15px]">
                            Namespace ID
                          </div>
                          <div className="px-3 text-[15px]  font-normal whitespace-pre-wrap break-words w-8/12">{nameSpaceId || '-'}</div>
                        </div>

                        <div className="flex flex-wrap w-full mb-1 mt-5">
                          <div className="py-1 max-h-8 mb-1 w-full text-center md:w-3/12 md:mr-1 text-white bg-[#7B2BF9] rounded text-[15px]">
                            Hex Message{'  '}
                          </div>
                          <div className="px-3 text-[15px] font-normal whitespace-pre-wrap break-words w-full md:w-8/12 ">{stringToHex(payload?.messageData)}</div>
                        </div>

                        <div className="flex flex-wrap mt-5 w-full ml-0">
                          <div className="py-1 mb-1 w-full text-center md:w-3/12 md:mr-1 text-white bg-black rounded text-[15px]">
                            Node IP
                          </div>
                          <div className="px-3 text-[15px]  font-normal whitespace-pre-wrap break-words w-8/12">{nodeIP || DEFUALT_NODE_IP}</div>
                        </div>

                      </div>
                    </div>
                  </div>
                }

                {activeItem === "txHash" &&

                  <div className="p-3">

                    <div className="font-medium cursor-pointer hover:underline text-[16px] text-blue-300 whitespace-pre-wrap break-words w-full ">
                      <a href={` https://testnet.mintscan.io/celestia-incentivized-testnet/txs/${response?.txhash}`} target="_blank" className=" ">

                        {response?.txhash}
                        <TbExternalLink size={25} className=" mx-1 hover:text-[40px] inline" />
                      </a>
                    </div>
                  </div>
                }

              </div>
            )}

            {!loading && !result?.success && (
              <div className="border-[1px] rounded-md p-3 text-red-400 bg-white">
                <h2>{result?.error}</h2>
              </div>
            )}
          </div>
        )}
        <br />
        <br />

      </div>

      <hr/>
      <hr />
      <hr />
      <div className="mt-6 mb-2 text-[#7B2BF9] flex justify-center">
      <a href="https://github.com/qubelabsio/celestia-pfb-app" target="_blank" classname="text-[#7B2BF9] cursor-pointer">
        <img className="w-8 h-8" src={githubLogo} alt="Github" />
      </a>
      </div>
    </section>
  );
};

export default Celestia;
