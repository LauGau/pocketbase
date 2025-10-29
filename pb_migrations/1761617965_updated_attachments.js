/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "createRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n@collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status ?= \"approved\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status ?= \"approved\""
  }, collection)

  return app.save(collection)
})
