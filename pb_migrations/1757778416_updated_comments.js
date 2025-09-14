/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" &&\npin.pinCollection.members.id ?= @request.auth.id",
    "viewRule": "@request.auth.id != \"\" &&\npin.pinCollection.members.id ?= @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // update collection data
  unmarshal({
    "createRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
