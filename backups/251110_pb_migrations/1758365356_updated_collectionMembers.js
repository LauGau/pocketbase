/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "createRule": "(@request.auth.id = user && @request.body.sharedToken = pinCollection.shareToken) || pinCollection.owner = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // update collection data
  unmarshal({
    "createRule": "(user = @request.auth.id ) || pinCollection.owner = @request.auth.id"
  }, collection)

  return app.save(collection)
})
