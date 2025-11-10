/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update collection data
  unmarshal({
    "name": "logs"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update collection data
  unmarshal({
    "name": "events"
  }, collection)

  return app.save(collection)
})
