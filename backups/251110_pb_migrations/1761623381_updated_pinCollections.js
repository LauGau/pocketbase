/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "updateRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(collectionMembers_via_pinCollection.user ?~ @request.auth.id && collectionMembers_via_pinCollection.status ?= \"approved\") &&\n\n// is user has the rights to update...\n(collectionMembers_via_pinCollection.user ?~ @request.auth.id && (collectionMembers_via_pinCollection.role ?= \"owner\" || collectionMembers_via_pinCollection.role ?= \"admin\"))",
    "viewRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(@collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status ?= \"approved\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id != \"\" && @collection.collectionMembers.pinCollection ?= id && @collection.collectionMembers.user ?= @request.auth.id",
    "viewRule": "collectionMembers_via_pinCollection.user ?= @request.auth.id && collectionMembers_via_pinCollection.status ?= \"approved\""
  }, collection)

  return app.save(collection)
})
