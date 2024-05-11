const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  //Modifications to data require to redeploy commands
  data: new SlashCommandBuilder()
    .setName("seat-us")
    .setDescription("Assigns a player to a seat")
    .addIntegerOption((option) =>
      option
        .setName("table-size")
        .setDescription("The number of seats per table")
        .setRequired(true)
        .setMinValue(2),
    )
    .addStringOption((option) =>
      option
        .setName("player-list")
        .setDescription("The comma separated list of all players")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("execution-variant")
        .setDescription("Selects between execution variants")
        .addChoices(
          { name: "One game", value: "one_game" },
          { name: "Session", value: "session" },
        ),
    ),
  //Modifications to execute does NOT require to redeploy commands
  async execute(interaction) {
    await interaction.deferReply();

    const tableSize = interaction.options.getInteger("table-size");
    const playerList = interaction.options.getString("player-list");
    const variant = interaction.options.getString("execution-variant");

    const players = playerList.split(",").map((x) => x.trim());
    const nbOfTables = Math.ceil(players.length / tableSize);
    const nbOfPlayersPerTable = Math.floor(players.length / nbOfTables);
    const nbOfExtraPlayers = players.length % nbOfPlayersPerTable;
    const HasToPlayWith = {};
    var hat;

    function shuffle(array) {
      let currentIndex = array.length,
        randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      return array;
    }
    function loadHat() {
      hat = players.map((x) => x);
      shuffle(hat);
    }
    function setUp_OneGame() {
      loadHat();
      let tablePlan = [[]];
      for (let tableIndex = 0; tableIndex < nbOfTables; tableIndex++) {
        let table = [];
        for (
          let playerIndex = 0;
          playerIndex < nbOfPlayersPerTable;
          playerIndex++
        ) {
          table.push(hat.pop());
        }
        tablePlan[0].push(table);
      }
      for (
        let extraPlayers = nbOfExtraPlayers;
        extraPlayers > 0;
        extraPlayers--
      ) {
        tablePlan[0][extraPlayers - 1].push(hat.pop());
      }
      return tablePlan;
    }

    function format_TablePlan(tablePlan) {
      let numberOfGames = tablePlan.length;
      let formatedString = "";
      let gameCounter = 1;
      for (const game of tablePlan) {
        formatedString += "Game " + gameCounter + " :\n";
        gameCounter++;
        let tableCounter = 1;
        for (const table of game) {
          formatedString +=
            "    Table " + tableCounter + " : " + table.join(", ");
          tableCounter++;
          if (tableCounter <= nbOfTables) {
            formatedString += "\n";
          }
        }
        if (gameCounter <= numberOfGames) {
          formatedString += "\n";
        }
      }
      return formatedString;
    }

    function anotherGameIsNeeded() {
      return Object.values(HasToPlayWith).some((e) => e.length > 0);
    }

    function loadHasToPlayWith(tablePlan) {
      const game1 = tablePlan[0];

      function playersImNotPlayingWith(myTableIndex) {
        let playersImNotPlayingWith = [];
        for (let tableIndex = 0; tableIndex < nbOfTables; tableIndex++) {
          if (tableIndex === myTableIndex) continue;
          let table = game1[tableIndex];
          playersImNotPlayingWith = playersImNotPlayingWith.concat(table);
        }
        return playersImNotPlayingWith;
      }

      for (let tableIndex = 0; tableIndex < nbOfTables; tableIndex++) {
        for (
          let playerIndex = 0;
          playerIndex < game1[tableIndex].length;
          playerIndex++
        ) {
          let player = game1[tableIndex][playerIndex];
          HasToPlayWith[player] = playersImNotPlayingWith(tableIndex);
        }
      }
    }

    function drawPlayer(players) {
      randomIndex = Math.floor(Math.random() * players.length);
      return players[randomIndex];
    }

    function findNeedyPlayers(players) {
      return players.filter((player) => HasToPlayWith[player].length > 0);
    }

    function findNeededPlayers(players, needyPlayer) {
      return players.filter((player) =>
        HasToPlayWith[needyPlayer].includes(player),
      );
    }

    function isNeedy(player) {
      return HasToPlayWith[player].length > 0;
    }

    function updateHasToPlayWith(newPlayer, seatedPlayers) {
      for (const player of seatedPlayers) {
        removeValueFromArray(newPlayer, HasToPlayWith[player]);
      }
      for (const player of seatedPlayers) {
        removeValueFromArray(player, HasToPlayWith[newPlayer]);
      }
    }

    function removeValueFromArray(value, arr) {
      let index = arr.indexOf(value);
      if (index >= 0) arr.splice(index, 1);
    }

    //execution  
    if (variant === "one_game") {
      let tablePlan = setUp_OneGame();
      let formatedTablePlan = format_TablePlan(tablePlan);
      console.log(formatedTablePlan);
      await interaction.editReply(formatedTablePlan);
    }

    if (variant === "session" || variant === null) {
      let tablePlan = setUp_OneGame();
      const game1 = tablePlan[0];
      let seatsByTable = [];
      for (let table of game1) {
        seatsByTable.push(table.length);
      }

      loadHasToPlayWith(tablePlan);
      while (anotherGameIsNeeded()) {
        let gamePlan = [];
        let unseatedPlayers = players.map((x) => x);

        for (let tableIndex = 0; tableIndex < nbOfTables; tableIndex++) {
          let table = [];
          let nextPlayer = null;
          for (
            let seatIndex = 0;
            seatIndex < seatsByTable[tableIndex];
            seatIndex++
          ) {
            if (nextPlayer)
              nextPlayer = drawPlayer(
                findNeededPlayers(unseatedPlayers, nextPlayer),
              );
            if (!nextPlayer)
              nextPlayer = drawPlayer(findNeedyPlayers(unseatedPlayers));
            if (!nextPlayer) nextPlayer = drawPlayer(unseatedPlayers);
            removeValueFromArray(nextPlayer, unseatedPlayers);
            updateHasToPlayWith(nextPlayer, table);
            table.push(nextPlayer);
          }
          gamePlan.push(table);
        }
        tablePlan.push(gamePlan);
      }
      let formatedTablePlan = format_TablePlan(tablePlan);
      console.log(formatedTablePlan);
      await interaction.editReply(formatedTablePlan);
    }
  },
};
