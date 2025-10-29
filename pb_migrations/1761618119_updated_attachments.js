/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "listRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")\n",
    "viewRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\"\n",
    "viewRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\"\n"
  }, collection)

  return app.save(collection)
})
