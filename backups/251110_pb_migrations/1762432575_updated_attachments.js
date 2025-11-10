/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "createRule": "//(@collection.collectionMembers.pinCollection ?= @request.body.pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status ?= \"approved\")\n\n// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "createRule": "//(@collection.collectionMembers.pinCollection ?= @request.body.pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status ?= \"approved\")\n\n// is user logged in ?\n@request.auth.id != \"\"\n\n// is the user an approved member?\n&& (@request.body.pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && @request.body.pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")"
  }, collection)

  return app.save(collection)
})
