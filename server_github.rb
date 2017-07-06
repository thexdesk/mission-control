#!/usr/bin/env ruby

require 'sinatra'
require 'redd/middleware'
require './wrapper_functions'

set :bind, '0.0.0.0' if ARGV[0] == 'production'
set :port, 8080

$reddit_post_id = '417weg'  # need to prompt for this along with authentication

use Rack::Session::Cookie, :secret => ''
use Redd::Middleware,
  user_agent:   'SpaceX Mission Control (via u/theZcuber)',
  client_id:    '',
  secret:       '',
  redirect_uri: 'http://localhost:8080/auth/callback',
  scope:        ['identity', 'submit', 'edit', 'read'],
  via:          '/auth'

get '/' do
  if request.env['redd.session']
    render_erb 'mission_control'
  else
    "<a href='/auth'>Authenticate</a>"
  end
end

get '/auth/callback' do
  redirect to '/' unless request.env['redd.error']
  "Error: #{request.env['redd.error'].message} (<a href='/'>Back</a>)"
end

get '/logout' do
  request.env['redd.session'] = nil
  redirect to '/'
end


# for live updates

get '/status' do
  render_erb 'status'
end

get '/post' do
  render_erb 'reddit_post'
end
