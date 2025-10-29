/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "updateRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member on the pinCollection?\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\") &&\n\n//pinCollection.owner = @request.auth.id\n\n\n// is user has the rights to update...\n(user ?~ @request.auth.id && (role ?= \"owner\" || role ?= \"admin\"))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "updateRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n\n//pinCollection.owner = @request.auth.id\n\n\n// is user has the rights to update...\n(user ?~ @request.auth.id && (role ?= \"owner\" || role ?= \"admin\"))"
  }, collection)

  return app.save(collection)
})
