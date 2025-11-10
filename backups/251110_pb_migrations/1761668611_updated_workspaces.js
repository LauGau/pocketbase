/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update collection data
  unmarshal({
    "updateRule": "// For logged in users\n@request.auth.id != \"\" &&\n\n// Only if the user is the owner of the Workspace\nowner.id = @request.auth.id &&\n\n// And the forbiden fields are not modified directly\n(\n  @request.body.plan:isset = false &&\n  @request.body.collections_count:isset = false &&\n  @request.body.collections_limit:isset = false &&\n  @request.body.storage_used:isset = false &&\n  @request.body.storage_limit:isset = false &&\n  @request.body.ls_customer_id:isset = false &&\n  @request.body.ls_subscription_id:isset = false &&\n  @request.body.subscription_status:isset = false\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update collection data
  unmarshal({
    "updateRule": "// For logged in users\n@request.auth.id != \"\" &&\n\n// Only if the user is the owner of the Workspace\nowner.id = @request.auth.id &&\n\n// And the forbiden fields are not modified directly\n(\n  @request.body.plan:isset = false ||\n  @request.body.collections_count:isset = false ||\n  @request.body.collections_limit:isset = false ||\n  @request.body.storage_used:isset = false ||\n  @request.body.storage_limit:isset = false ||\n  @request.body.ls_customer_id:isset = false ||\n  @request.body.ls_subscription_id:isset = false ||\n  @request.body.subscription_status:isset = false\n)"
  }, collection)

  return app.save(collection)
})
