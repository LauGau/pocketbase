/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "listRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n// (user ?~ @request.auth.id && status ?= \"approved\")\n\n// is the user an approved member?\n// (status = \"approved\")\n//(user = @request.auth.id && status = \"approved\")\n\n// is the user an approved member?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "listRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n// (user ?~ @request.auth.id && status ?= \"approved\")\n\n// is the user an approved member?\n(status = \"approved\")\n\n// is the user an approved member?\n//(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")"
  }, collection)

  return app.save(collection)
})
