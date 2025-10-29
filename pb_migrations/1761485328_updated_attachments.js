/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.id != \"\" && (creator = @request.auth.id || (@collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && (@collection.collectionMembers.role = \"owner\" || @collection.collectionMembers.role = \"admin\")))",
    "updateRule": "@request.auth.id != \"\" && (creator = @request.auth.id || (@collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && (@collection.collectionMembers.role = \"owner\" || @collection.collectionMembers.role = \"admin\")))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.id != \"\" && creator = @request.auth.id",
    "updateRule": "@request.auth.id != \"\" && creator = @request.auth.id"
  }, collection)

  return app.save(collection)
})
