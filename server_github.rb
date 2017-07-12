#!/usr/bin/env ruby

require 'sinatra'
require 'redd/middleware'
require './helper_functions'

set :bind, '0.0.0.0' if ARGV[0] == 'production'
set :port, 8080

enable :sessions  # for session variables
use Redd::Middleware,
  user_agent:   'SpaceX Mission Control (via u/theZcuber)',
  client_id:    '',
  secret:       '',
  redirect_uri: 'http://localhost:8080/auth/callback',
  scope:        ['identity', 'submit', 'edit', 'read'],
  via:          '/auth'

# OAuth and main page

get '/' do
  if request.env['redd.session']
    render_erb 'mission_control'
  else
    render_erb 'authenticate'
  end
end

get '/auth/callback' do
  if request.env['redd.error']
    "Error: #{request.env['redd.error'].message} (<a href='/'>Back</a>)"
  elsif not session[:launch] or not session[:video]
    redirect to 'init'
  else
    redirect to '/'
  end
end

get '/logout' do
  request.env['redd.session'] = nil
  redirect to '/'
end


# for updating section

get '/status' do
  render_erb 'sections/status'
end

get '/post' do
  render_erb 'sections/live_post'
end

# initializing variables
get '/init' do
  render_erb 'init'
end

post '/init' do
  # not doing server-side validation on this
  # if someone wants to bypass the validation, it only screws things up for them
  session[:launch] = params[:launch]
  session[:video] = params[:video].match(/^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=)?([\w-]{10,})/)[1]  # get video id from url
  redirect to '/'
end


# receive updates
post '/update' do
  session[params[:id]] = params[:value]
  update_post unless ['time', 'launch', 'video'].include? params[:id]
end
