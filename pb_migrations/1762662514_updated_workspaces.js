/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update collection data
  unmarshal({
    "viewRule": "// For logged in users\n@request.auth.id != \"\"\n\n// Members of a noteCollection should be abble to GET a worspace (required to check storage space available)\n&& (@collection.collectionMembers.user ?~ @request.auth.id && @collection.collectionMembers.status ?= \"approved\" && @collection.collectionMembers.pinCollection.workspace ?= id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update collection data
  unmarshal({
    "viewRule": "// For logged in users\n@request.auth.id != \"\"\n\n// Members of a noteCollection should be abble to GET a worspace (required to check storage space available)\n&& (@collection.collectionMembers.user ?~ @request.auth.id && @collection.collectionMembers.status ?= \"approved\" && @collection.collectionMembers.pinCollection.workspace = id)"
  }, collection)

  return app.save(collection)
})
