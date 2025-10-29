/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "createRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")",
    "listRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")",
    "viewRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\"",
    "listRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\"",
    "viewRule": "@request.auth.id != \"\" && pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\""
  }, collection)

  return app.save(collection)
})
