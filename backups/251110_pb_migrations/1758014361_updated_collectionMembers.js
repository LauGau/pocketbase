/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "createRule": "pinCollection.owner = @request.auth.id",
    "deleteRule": "pinCollection.owner = @request.auth.id",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "pinCollection.owner = @request.auth.id",
    "viewRule": "user = @request.auth.id || pinCollection.members ?= @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
