/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "createRule": "// BEFORE 2025-10-28\n// @request.auth.id != \"\"\n\n// is user logged in ?\n@request.auth.id != \"\" &&\n\n// is the user the owner of the workspace where the collection is being created ?\n@request.body.workspace.owner = @request.auth.id\n\n\n// is the max collection count for the workspace plan not reached yet ?"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
})
