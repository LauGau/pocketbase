/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "deleteRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(collectionMembers_via_pinCollection.user ?~ @request.auth.id && collectionMembers_via_pinCollection.status ?= \"approved\") &&\n\n// is user has the rights to delete...\n(collectionMembers_via_pinCollection.user ?~ @request.auth.id && (collectionMembers_via_pinCollection.role ?= \"owner\" || collectionMembers_via_pinCollection.role ?= \"admin\"))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.id != \"\" &&\n@request.auth.id = owner.id"
  }, collection)

  return app.save(collection)
})
