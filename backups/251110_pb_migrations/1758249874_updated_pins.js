/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id",
    "listRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id",
    "viewRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\npinCollection.members.id ?= @request.auth.id",
    "listRule": "@request.auth.id != \"\" &&\npinCollection.members.id ?= @request.auth.id",
    "viewRule": "@request.auth.id != \"\" &&\npinCollection.members.id ?= @request.auth.id"
  }, collection)

  return app.save(collection)
})
