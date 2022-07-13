/*///////////////////////////////////////////////////////////*/
// ╔════════════════════════════════════════════════════════╗//
// ║                                                        ║//
// ║    ██╗███╗░░██╗░█████╗░██╗░░██╗██╗██╗░░░░░░█████╗░░░░  ║//
// ║    ██║████╗░██║██╔══██╗██║░░██║██║██║░░░░░██╔══██╗░░░  ║//
// ║    ██║██╔██╗██║███████║███████║██║██║░░░░░██║░░╚═╝░░░  ║//
// ║    ██║██║╚████║██╔══██║██╔══██║██║██║░░░░░██║░░██╗░░░  ║//
// ║    ██║██║░╚███║██║░░██║██║░░██║██║███████╗╚█████╔╝██╗  ║//
// ║    ╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝╚══════╝░╚════╝░╚═╝  ║//
// ║                        D-ConfigBot                     ║//
// ╚════════════════════════════════════════════════════════╝//
/*///////////////////////////////////////////////////////////*/

module.exports = {
  BaseClient: require('discord.js').BaseClient,
  ConfigBot: require("./clases/Client"),
  Evento: require("./clases/ClientEventClass"),
  DiscordUtils: require("./clases/ClientUtils"),
  Comando: require("./clases/ClientCommandClass"),
  SlashCommand: require("./clases/SlashCommand"),

  Shard: require('discord.js').Shard,
  ShardClientUtil: require('discord.js').ShardClientUtil,
  ShardingManager: require('discord.js').ShardingManager,
  WebhookClient: require('discord.js').WebhookClient,

  MessageButton: require("discord.js").MessageButton,
  MessageActionRow: require("discord.js").MessageActionRow,
  MessageMenuOption: require("discord.js").MessageMenuOption,
  MessageMenu: require("discord.js").MessageMenu,
  MessageSelectMenu: require("discord.js").MessageSelectMenu, 

  ActivityFlags: require('discord.js').ActivityFlags,
  BitField: require('discord.js').BitField,
  Collection: require('discord.js').Collection,
  Constants: require('discord.js').Constants,
  DataResolver: require('discord.js').DataResolver,
  BaseManager: require('discord.js').BaseManager,
  DiscordAPIError: require('discord.js').DiscordAPIError,
  HTTPError: require('discord.js').HTTPError,
  MessageFlags: require('discord.js').MessageFlags,
  Intents: require('discord.js').Intents,
  Permissions: require('discord.js').Permissions,
  Speaking: require('discord.js').Speaking,
  Snowflake: require('discord.js').Snowflake,
  SnowflakeUtil: require('discord.js').SnowflakeUtil,
  Structures: require('discord.js').Structures,
  UserFlags: require('discord.js').UserFlags,
  SystemChannelFlags: require('discord.js').SystemChannelFlags,
  Util: ('discord.js').Util,
  version: require('discord.js').version,

  ChannelManager: require('discord.js').ChannelManager,
  GuildChannelManager: require('discord.js').GuildChannelManager,
  GuildEmojiManager: require('discord.js').GuildEmojiManager,
  GuildEmojiRoleManager: require('discord.js').GuildEmojiRoleManager,
  GuildMemberManager: require('discord.js').GuildMemberManager,
  GuildMemberRoleManager: require('discord.js').GuildMemberRoleManager,
  GuildManager: require('discord.js').GuildManager,
  ReactionUserManager: require('discord.js').ReactionUserManager,
  MessageManager: require('discord.js').MessageManager,
  PresenceManager: require('discord.js').PresenceManager,
  RoleManager: require('discord.js').RoleManager,
  UserManager: require('discord.js').UserManager,

  discordSort: require('discord.js').discordSort,
  escapeMarkdown: require('discord.js').escapeMarkdown,
  fetchRecommendedShards: require('discord.js').fetchRecommendedShards,
  resolveColor: require('discord.js').resolveColor,
  resolveString: require('discord.js').resolveString,
  splitMessage: require('discord.js').splitMessage,

  Base: require('discord.js').Base,
  Activity: require('discord.js').Activity,
  APIMessage: require('discord.js').APIMessage,
  BaseGuildEmoji: require('discord.js').BaseGuildEmoji,
  CategoryChannel: require('discord.js').CategoryChannel,
  Channel: require('discord.js').Channel,
  ClientApplication: require('discord.js').ClientApplication,
  get ClientUser() {
    return require('discord.js').ClientUser;
  },
  Collector: require('discord.js').Collector,
  DMChannel: require('discord.js').DMChannel,
  Emoji: require('discord.js').Emoji,
  Guild: require('discord.js').Guild,
  GuildAuditLogs: require('discord.js').GuildAuditLogs,
  GuildChannel: require('discord.js').GuildChannel,
  BaseGuild: require('discord.js').BaseGuild,
  BaseGuildTextChannel: require('discord.js').BaseGuildTextChannel,
  BaseGuildVoiceChannel: require('discord.js').BaseGuildVoiceChannel,  
  GuildEmoji: require('discord.js').GuildEmoji,
  GuildMember: require('discord.js').GuildMember,
  GuildPreview: require('discord.js').GuildPreview,
  Integration: require('discord.js').Integration,
  Invite: require('discord.js').Invite,
  Message: require('discord.js').Message,
  MessageAttachment: require('discord.js').MessageAttachment,
  MessageCollector: require('discord.js').MessageCollector,
  MessageEmbed: require('discord.js').MessageEmbed,
  MessageMentions: require('discord.js').MessageMentions,
  MessageReaction: require('discord.js').MessageReaction,
  NewsChannel: require('discord.js').NewsChannel,
  PermissionOverwrites: require('discord.js').PermissionOverwrites,
  Presence: require('discord.js').Presence,
  ClientPresence: require('discord.js').ClientPresence,
  ReactionCollector: require('discord.js').ReactionCollector,
  ReactionEmoji: require('discord.js').ReactionEmoji,
  RichPresenceAssets: require('discord.js').RichPresenceAssets,
  Role: require('discord.js').Role,
  StoreChannel: require('discord.js').StoreChannel,
  Team: require('discord.js').Team,
  TeamMember: require('discord.js').TeamMember,
  TextChannel: require('discord.js').TextChannel,
  User: require('discord.js').User,
  VoiceChannel: require('discord.js').VoiceChannel,
  VoiceRegion: require('discord.js').VoiceRegion,
  VoiceState: require('discord.js').VoiceState,
  Webhook: require('discord.js').Webhook,

  WebSocket: require('discord.js').WebSocket,
}