const axios = require('axios');
const cookie = require('cookie');
const get = require('lodash/get');

// API token to use to access Notion
const NOTION_API_TOKEN = process.env.NOTION_API_TOKEN;
// ID of the Notion workspace to add users to
const NOTION_SPACE_ID = process.env.NOTION_SPACE_ID;
// ID of the user we're authenticating as
const NOTION_USER_ID = process.env.NOTION_USER_ID;
// Role to use when creating new users. 'editor' means admin and
// 'read_and_write' means member.
const NOTION_ROLE = process.env.NOTION_ROLE || 'read_and_write';

const cookies = Object.entries({
  token_v2: NOTION_API_TOKEN,
  userId: NOTION_USER_ID
}).map(([name, value]) => cookie.serialize(name, value)).join('; ');

const requester = axios.create({
  baseURL: 'https://www.notion.so/api/v3/',
  headers: {
    'Cookie': cookies,
    'User-Agent': 'Notion-Inviter/0.0.1 (https://github.com/makesaltlake/notion-inviter)'
  },
  validateStatus: (status) => status >= 200 && status < 400
});

exports.invite = async (email) => {
  try {
    // first, see if notion already knows about the user
    let userId = get(await requester.post('findUser', {email}), 'data.value.value.id');
    if (!userId) {
      // this user doesn't have a notion account. create one for them.
      await requester.post('createEmailUser', {email});
      // then re-fetch their email info after a short delay since createEmailUser
      // seems to send back unintelligent nonsense some of the time. TODO: figure
      // out why that is.
      await new Promise(resolve => setTimeout(resolve, 500));
      const findUserResponse = await requester.post('findUser', {email});
      let userId = get(findUserResponse, 'data.value.value.id');
      if (!userId) {
        console.log("Couldn't get user id after creating user. Response:", findUserResponse.data, 'and status:', findUserResponse.status);
        throw new Error("Couldn't get user id after creating user");
      }
    }
    // then invite them to this workspace. the response will be the same whether
    // or not the user was already a member of the workspace, so no need to
    // handle that case.
    const body = {
      "operations": [
        {
          "table": "space",
          "id": NOTION_SPACE_ID,
          "command": "setPermissionItem",
          "path": ["permissions"],
          "args": {
            "type": "user_permission",
            "user_id": userId,
            "role": NOTION_ROLE
          }
        }, {
          "table": "space",
          "id": NOTION_SPACE_ID,
          "command": "update",
          "path": [],
          "args": {
            "last_edited_time": `${Math.floor(new Date())}`
          }
        }
      ]
    };
    await requester.post('submitTransaction', body);
    // and we're done!
  } catch (e) {
    if (e.response) {
      console.log('Request failed. Response:', e.response.data, 'and status:', e.response.status, 'and request:', e.request);
    }
    throw e;
  }
};
