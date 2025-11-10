/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_attachments_data_url` ON `attachments` (JSON_EXTRACT(data, '$.url'))"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
