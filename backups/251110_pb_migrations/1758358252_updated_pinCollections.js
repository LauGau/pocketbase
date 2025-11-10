/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": "@collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status = \"approved\""
  }, collection)

  return app.save(collection)
})
