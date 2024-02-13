import { fileURLToPath } from "node:url";
import { createBareServer } from "@nebula-services/bare-server-node";
import { createServer } from "node:http";
import { hostname } from "node:os";
import path from "node:path";
import Unblocker from "unblocker";
import axios from "axios";
import express from "express";
import { uvPath } from "uv-2.0-pkg";
import { dynamicPath } from "@nebula-services/dynamic";
import bodyParser from 'body-parser';
const apiKey = process.argv[2] || 'none';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`
};

var unblocker = new Unblocker({prefix: '/sussyuncle/'});
const app = express();
app.use(bodyParser.json());
app.use(express.static("./public"));
const __dirname = process.cwd();
const server = createServer();
app.use(unblocker);
const bareServer = createBareServer("/bare/", {
  logErrors: false,
  localAddress: undefined,
  maintainer: {
    email: "aria-browser",
    website: "by rxfe-a on github.com/rxfe-a/aria",
  },
});

app.use("/uv2/", express.static(uvPath));
app.use("/dynamic/", express.static(dynamicPath));

server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
      } else {
        app(req, res);
      }
  });

server.on("upgrade", (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    }
});

app.use(express.json());

app.post('/ask', async (req, res) => {
  const apiUrl = 'https://api.shuttleai.app/v1';
  const model = 'gpt-4';

  if (apiKey === 'none') {
    const errorResponse = {
      choices: [
        {
          finish_reason: 'stop',
          index: 0,
          message: {
            content: 'Unfortunately, This server does not have AI Enabled. Contact the server maintainer to add AI',
            role: 'assistant'
          }
        }
      ],
      created: 2093,
      id: 'OFFICIAL-SERVER-ERROR',
      model: 'gpt-4',
      object: 'chat.completion',
      usage: {
        completion_tokens: null,
        prompt_tokens: null,
        total_tokens: null
      }
    };
  
    return res.json(errorResponse);
  }
  
  try {
    const { question } = req.body;
    const data = {
      model: model,
      messages: [
        { role: 'user', content: question }
      ]
    };
    const shuttleResponse = await axios.post(
      `${apiUrl}/chat/completions`,
      data,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const result = shuttleResponse.data;
    res.json(result);
    console.log(result);
  } catch (error) {
    console.error(error.response.data);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


if (apiKey == 'none') {
  console.log('GPT is Enabled')
}
server.on("listening", () => {
  const addr = server.address();
  console.log('\x1b[38;5;93maria\x1b[0m \x1b[37mv0.2\x1b[0m');
  console.log("")
  console.log('\x1b[35m%s\x1b[0m', `Local: http://${addr.family === "IPv6" ? `[${addr.address}]` : addr.address}${addr.port === 80? "" : ":" + addr.port}`);
  console.log('\x1b[35m%s\x1b[0m', `Local: http://localhost${addr.port === 80? "" : ":" + addr.port}`);
  try { console.log('\x1b[35m%s\x1b[0m', `On Your Network: http://${hostname()}${addr.port === 80? "" : ":" + addr.port}`); } catch (err) {/* Can't find LAN interface */};
});

server.listen({ port: process.env.PORT || 6969 }) 