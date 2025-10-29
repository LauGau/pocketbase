/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update collection data
  unmarshal({
    "updateRule": "// For logged in users\n@request.auth.id != \"\" &&\n\n// Only if the user is the owner of the Workspace\nowner.id = @request.auth.id\n\n// And the forbiden fields are not modified directly\n// (@request.body.plan:isset = true)",
    "viewRule": "// For logged in users\n@request.auth.id != \"\" &&\n\n// Only if the user is the owner of the Workspace\nowner.id = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update collection data
  unmarshal({
    "updateRule": "owner = @request.auth.id",
    "viewRule": "@request.auth.id != ''"
  }, collection)

  return app.save(collection)
})
