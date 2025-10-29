/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update collection data
  unmarshal({
    "listRule": "//BEFORE 2025-10-28\n//@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id\n\n// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")",
    "viewRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id",
    "viewRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id"
  }, collection)

  return app.save(collection)
})
