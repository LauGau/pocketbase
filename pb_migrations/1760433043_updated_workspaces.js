/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number1886038029",
    "max": null,
    "min": null,
    "name": "storage_used",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3327181035",
    "max": 0,
    "min": 0,
    "name": "ls_customer_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2692726917",
    "max": 0,
    "min": 0,
    "name": "ls_subscription_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select3002498459",
    "maxSelect": 1,
    "name": "subscription_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "active",
      "paused",
      "cancelled"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // remove field
  collection.fields.removeById("number1886038029")

  // remove field
  collection.fields.removeById("text3327181035")

  // remove field
  collection.fields.removeById("text2692726917")

  // remove field
  collection.fields.removeById("select3002498459")

  return app.save(collection)
})
