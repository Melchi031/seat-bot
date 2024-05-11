# Running in node

```
node .
```

OR

```
node index.js
```

# Building Docker

Build:

```
docker build -t seat-bot .
```

Run:

```
docker run -d --name seat-bot seat-bot
```

# Adding a bot to a guild (server)

To add a bot to a guild, click the link :
https://discord.com/oauth2/authorize?client_id=1235670437749588009&permissions=0&scope=bot+applications.commands

To register bot commands to a guild :
First, enter your guild ID in the .env file

```
GUILD_ID="yourGuildId"
```

in Discord, you'll find your guild id this way : Enable developer mode > Right-click the server title > "Copy ID"
Once that is done, run:

```
npm deploy-commands.js
```

The registration of bot commands is necessary everytime a modification is made to a command's data
Modifications to command's execution does not require registration.
