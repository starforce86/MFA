"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "PromoCode",
    embedded: false
  },
  {
    name: "TransferPlan",
    embedded: false
  },
  {
    name: "TransferTransaction",
    embedded: false
  },
  {
    name: "Settings",
    embedded: false
  },
  {
    name: "ActivationCode",
    embedded: false
  },
  {
    name: "RestoreCode",
    embedded: false
  },
  {
    name: "UserRole",
    embedded: false
  },
  {
    name: "Video",
    embedded: false
  },
  {
    name: "WatchedVideoUser",
    embedded: false
  },
  {
    name: "Tag",
    embedded: false
  },
  {
    name: "Category",
    embedded: false
  },
  {
    name: "Post",
    embedded: false
  },
  {
    name: "Curriculum",
    embedded: false
  },
  {
    name: "PlayHistory",
    embedded: false
  },
  {
    name: "ChargeHistory",
    embedded: false
  },
  {
    name: "SubscriptionHistory",
    embedded: false
  },
  {
    name: "ArtistFactorsSetting",
    embedded: false
  },
  {
    name: "ArtistFactors",
    embedded: false
  },
  {
    name: "VideoTotalParameters",
    embedded: false
  },
  {
    name: "ProfitPoolFactor",
    embedded: false
  },
  {
    name: "VideoDataForMonth",
    embedded: false
  },
  {
    name: "VideoParameters",
    embedded: false
  },
  {
    name: "VideoParametersForMonth",
    embedded: false
  },
  {
    name: "TotalMinutesForArtist",
    embedded: false
  },
  {
    name: "ProfitPoolCalculation",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `${process.env["PRISMA_ENDPOINT"]}`,
  secret: `${process.env["PRISMA_SECRET"]}`
});
exports.prisma = new exports.Prisma();
