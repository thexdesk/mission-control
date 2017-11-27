#!/usr/bin/env ruby

# show stdout in logs
$stdout.sync = true

require 'sinatra'
require 'redd/middleware'
require './src/functions'
require './src/recovery'

set :bind, '0.0.0.0' if ARGV[0] == 'production'

use Rack::Deflater # gzip assets
use Rack::Session::Pool, # identifier that points to session data
  expire_after: 60 * 60 * 24 * 7 # one week

# permissions:
# edit      edit the post after it's made
# identity  know your username
# read      let us display the post in the corner
# submit    make the post from your account
use Redd::Middleware,
  user_agent:   'SpaceX Mission Control (via u/theZcuber)',
  client_id:    ENV['CLIENT_ID'],
  secret:       ENV['SECRET'],
  redirect_uri: ENV['REDIRECT_URI'], # this lets us have production and tetsing
  scope:        %w[edit identity read submit],
  via:          '/auth'

# browser support, authentication, main display
get '/' do
  # are requisite features supported?
  # automatic check, nearly invisible to user
  if !session[:support]
    render_erb 'pages/support_check'

  # are we logged in?
  # yes -> show interface
  elsif request.env['redd.session']
    render_erb 'pages/mission_control'

  # not logged in -> authentication prompt
  else
    render_erb 'pages/authenticate'
  end
end

# browser support is ok (or override)
get '/supported' do
  session[:support] = true
  redirect to '/'
end

# callback from reddit OAuth
get '/auth/callback' do
  # something messed up
  if request.env['redd.error']
    "Error: #{request.env['redd.error'].message} (<a href='/'>Back</a>)"

  # launch and video are both set, go to interface
  elsif session[:launch] && session[:video]
    redirect to '/'

  # launch and/or video are not set, let's initialize it
  else
    redirect to 'init'
  end
end

# log out and clear session
get '/logout' do
  request.env['redd.session'] = nil
  session.clear
  redirect to '/'
end

# live rendering of post for interface
get '/post' do
  render_erb 'sections/live_post'
end

# prompt for setting launch and YT video OR recovery of existing thread
get '/init' do
  render_erb 'pages/init'
end

# form submission from initialization
# set launch and YT video
post '/init' do
  # not doing server-side validation on this
  # if someone wants to bypass the validation, it only screws things up for them

  # if it's a launch from the API, it'll have launch time included as well
  # launch time is unix timestamp after pipe
  if params[:launch].include? '|'
    nametime = params[:launch].split '|'
    session[:launch] = nametime[0]
    session[:time] = nametime[1].to_i * 1000 # JS wants milliseconds

  # not from API
  else
    session[:launch] = params[:launch]
  end

  # get video id from url
  # blank input doesn't set anything ─ nil or '' displays nothing to client
  if params[:video] != ''
    session[:video] = params[:video].match(%r{^(?:https?://)?(?:www\.)?
    youtu(?:\.be|be\.com)/(?:watch\?v=)?([\w-]{11,})}x)[1]
  end

  puts params[:take]

  # set 'take' if it's passed
  session[:take] = params[:take] if params[:take] != ''

  redirect to '/'
end

# receive updates and set in session variable
post '/update' do
  params = JSON.parse(request.body.read, symbolize_names: true)
  session[params[:id].to_sym] = params[:value]
  update_post unless %w[time launch video].include? params[:id]
end

# called only when post doesn't exist
# creates blank reddit post
get '/update/create' do
  update_post true
end

# recover old post
# expecting reddit URL posted as JSON
# 270 & 271 are not official, just being used because we need a 2** code
# status -> 200 if successful
#           270 if another user's post
#           271 if not self post
post '/recover' do
  params = JSON.parse(request.body.read, symbolize_names: true)
  status recover_post params[:url]
end
