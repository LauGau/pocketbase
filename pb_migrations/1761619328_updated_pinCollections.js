/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": "// everybody can see collections to allow search / join feature\n@request.auth.id != \"\" || @request.auth.id = \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update collection data
  unmarshal({
    "listRule": ""
  }, collection)

  return app.save(collection)
})
