/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\"\n",
    "viewRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\"\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && ((pinCollection.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status = \"approved\") || (pin.id != \"\" && @collection.collectionMembers.pinCollection ?= pin.pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status = \"approved\") || (comment.id != \"\" && @collection.collectionMembers.pinCollection ?= comment.pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status = \"approved\"))\n",
    "viewRule": "@request.auth.id != \"\" && ((pinCollection.id != \"\" && @collection.collectionMembers.pinCollection ?= pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status = \"approved\") || (pin.id != \"\" && @collection.collectionMembers.pinCollection ?= pin.pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status = \"approved\") || (comment.id != \"\" && @collection.collectionMembers.pinCollection ?= comment.pinCollection.id && @collection.collectionMembers.user ?= @request.auth.id && @collection.collectionMembers.status = \"approved\"))\n"
  }, collection)

  return app.save(collection)
})
