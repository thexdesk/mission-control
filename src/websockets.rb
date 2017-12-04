require 'json'
require 'sinatra-websocket'

set :sockets, []

def emit_message(message)
  EM.next_tick do
    settings.sockets.each do |socket|
      socket.send message.to_s
    end
  end
end

def handle_socket(req)
  req.websocket do |ws|
    ws.onopen do
      settings.sockets << ws
    end

    ws.onclose do
      settings.sockets.delete ws
    end
  end
end
