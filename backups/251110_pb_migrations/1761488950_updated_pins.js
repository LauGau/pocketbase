/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= @request.body.pinCollection && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status = \"approved\""
  }, collection)

  return app.save(collection)
})
