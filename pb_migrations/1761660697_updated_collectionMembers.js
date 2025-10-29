/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "listRule": "// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user an approved member?\n(user ?~ @request.auth.id && status ?= \"approved\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
})
