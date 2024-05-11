# .env

In order for the bot to run, you have to create a .env file at the root of the repository.
The file should contain 3 variables :

```
DISCORD_TOKEN="yourPrivateDiscordToken"
CLIENT_ID="yourPrivateApplicationId"
GUILD_ID="yourPrivateGuildID"
```

In Discord, you'll find your guild id this way : Enable developer mode > Right-click the server title > "Copy ID"
For your other IDs, go to : https://discord.com/developers/applications
In your App, under "General Information" you can find your "Application ID". This number goes with CLIENT_ID in the .env file.
In your App, under "Bot", you can find your Token. Click Reset Token to generate one. There is no way to see a previously issued token.

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

To register bot commands to a guild, run :

```
npm deploy-commands.js
```

The registration of bot commands is necessary everytime a modification is made to a command's data
Modifications to command's execution does not require registration.
