/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select3713686397",
    "maxSelect": 1,
    "name": "plan",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "free",
      "starter",
      "pro",
      "premium",
      "custom"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select3713686397",
    "maxSelect": 1,
    "name": "plan",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "free"
    ]
  }))

  return app.save(collection)
})
