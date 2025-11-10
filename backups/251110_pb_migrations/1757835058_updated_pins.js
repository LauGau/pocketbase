/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "number1057733009",
    "max": null,
    "min": 0,
    "name": "commentsCount",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // update field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "number1057733009",
    "max": null,
    "min": 0,
    "name": "commentCount",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
