/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // update collection data
  unmarshal({
    "createRule": "// Only for logged-in users\n@request.auth.id != \"\" &&\n\n// Only for users who are \"approved\" members of the related pinCollection\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")",
    "deleteRule": "// Only for logged-in users\n@request.auth.id != \"\" &&\n\n// Only for users who are \"approved\" members of the related pinCollection\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\") &&\n\n// For the users who created the comments or admins...\n(creator = @request.auth.id || (pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && (pinCollection.collectionMembers_via_pinCollection.role ?= \"owner\" || pinCollection.collectionMembers_via_pinCollection.role ?= \"admin\")))",
    "listRule": "// BEFORE 2025-10-28\n// pin.pinCollection ?= @collection.collectionMembers.pinCollection && @collection.collectionMembers.user ?= @request.auth.id\n\n// Only for logged-in users\n@request.auth.id != \"\" &&\n\n// Only for users who are \"approved\" members of the related pinCollection\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")",
    "updateRule": "// Only for logged-in users\n@request.auth.id != \"\" &&\n\n// Only for users who are \"approved\" members of the related pinCollection\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\") &&\n\n// Only for the users who are editing a comment they created themselves\ncreator = @request.auth.id",
    "viewRule": "// Only for logged-in users\n@request.auth.id != \"\" &&\n\n// Only for users who are \"approved\" members of the related pinCollection\n(pinCollection.collectionMembers_via_pinCollection.user ?~ @request.auth.id && pinCollection.collectionMembers_via_pinCollection.status ?= \"approved\")"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // update collection data
  unmarshal({
    "createRule": "pin.pinCollection ?= @collection.collectionMembers.pinCollection && @collection.collectionMembers.user ?= @request.auth.id",
    "deleteRule": "@request.auth.id != \"\" &&\ncreator = @request.auth.id",
    "listRule": "pin.pinCollection ?= @collection.collectionMembers.pinCollection && @collection.collectionMembers.user ?= @request.auth.id",
    "updateRule": "@request.auth.id != \"\" &&\ncreator = @request.auth.id",
    "viewRule": "pin.pinCollection ?= @collection.collectionMembers.pinCollection && @collection.collectionMembers.user ?= @request.auth.id"
  }, collection)

  return app.save(collection)
})
