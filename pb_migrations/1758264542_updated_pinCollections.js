/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id",
    "viewRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id"
  }, collection)

  return app.save(collection)
})
