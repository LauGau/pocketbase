/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= @request.body.pinCollection && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status = \"approved\"",
    "deleteRule": "@request.auth.id != \"\" && (creator = @request.auth.id || (pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && (pinCollection.collectionMembers_via_pinCollection.role = \"owner\" || pinCollection.collectionMembers_via_pinCollection.role = \"admin\")))",
    "listRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status = \"approved\"",
    "updateRule": "@request.auth.id != \"\" && (creator = @request.auth.id || (pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && (pinCollection.collectionMembers_via_pinCollection.role = \"owner\" || pinCollection.collectionMembers_via_pinCollection.role = \"admin\")))",
    "viewRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status = \"approved\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id",
    "deleteRule": "@request.auth.id != \"\" && creator = @request.auth.id",
    "listRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id",
    "updateRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id",
    "viewRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id"
  }, collection)

  return app.save(collection)
})
