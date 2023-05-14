
# Celestia PFB (PayForBlob) App

Celestia PFB App is a user-friendly web application designed for submitting PayForBlob (PFB) transactions on the Celestia network. The app also provides the option to select the default node API or input a manual one, ensuring that users have complete control over their transactions. Built with both front-end and back-end functionalities, Celestia PFB App can be easily deployed in most environments. 

**Features:**
* Built with Frontend and API backend (No CORS issues).
* Option of using the default or manual Node API.
* Customizable fee and gas limits.

## Demo

https://celestia-pfb.zone/



https://github.com/qubelabsio/celestia-pfb-app/assets/61059709/1303947e-0db1-4233-aa46-2370581ca5e4



## Frontend Deployment

### Requirements
* [NodeJS](https://nodejs.org/en)
* [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

### Build:
```bash
  yarn install
  yarn start
```
### Configure your endpoints
Go to `/src/config/app.config.js` and change the value of `DEFUALT_NODE_IP` and `LEMBDA_HOST_URL` with your endpoints.


## Backend Deployment
By default, the app is supported by backend code deployed over AWS Lambda functions:

- get-shares

- submit-pfb

To make any changes in your lambda functions, got to `/server/<functionName>` directory and make changes in `index.js` file. Then install all dependencies:

```bash
  yarn install
```
### Ruuning Backend Locally
Go to `/server/nodejs-express` and run

```
yarn install
yarn start
```

To connect your frontend app with local server, just uncomment `line 5` and comment `line 8` of `/src/config/app.config.js`.





