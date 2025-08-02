# import eventlet

# eventlet.monkey_patch()  # must be first!

# from root import create_app  # make sure this import comes after monkey_patch()

# app, socketio = create_app()

# if __name__ == "__main__":
#     socketio.run(app, host="localhost", port=5000, debug=True)


from root import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)


# from root import create_app, socketio

# app = create_app()

# if __name__ == "__main__":
#     socketio.run(app, host="0.0.0.0", port=5000, debug=True)
